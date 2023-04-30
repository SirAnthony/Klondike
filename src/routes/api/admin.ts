import {BaseRouter, CheckRole} from '../base'
import {UserController, CorpController, PlanetController, ConfigController, institutionController, ShipController} from '../../entity'
import {OrderController, ItemController} from '../../entity'
import {UserType, Patent, PatentStatus, ItemType} from '../../../client/src/common/entity'
import {InstitutionType, PlanetType, Planet} from '../../../client/src/common/entity'
import {Owner, Location} from '../../../client/src/common/entity'
import {RenderContext} from '../../middlewares'
import {ApiError, Codes} from '../../../client/src/common/errors'
import {IDMatch} from '../../util/server'
import {Time} from '../../util/time'
import * as curls from '../../../client/src/common/urls'
import * as util from '../../../client/src/common/util'
import config from '../../config'
import {promises as fs} from 'fs'

type AllInstControllers = UserController | CorpController | ShipController
type AllControllers = (AllInstControllers | ItemController | OrderController | PlanetController) & {
    owner?: Owner
    assignee?: Owner
    relation?: Owner
    captain?: Owner
    owners?: Owner[]
    location?: Location
}
async function process_data(obj: AllControllers, data){
    const keys = obj.keys
    const fields = Object.keys(data).filter(f=>!keys.includes(f))
    if (fields.length)
        console.error(`sent incorrect fields: ${JSON.stringify(fields)}`)
    for (let k in data)
        obj[k] = data[k]
    if (data.owner?._id)
        obj.owner = (await institutionController(+data.owner.type).get(data.owner._id)).asOwner
    if (data.location?._id){
        const planet = await PlanetController.get(data.location._id);
        obj.location = PlanetController.location(planet, data.location.pos)
    }
    if (data.assignee?._id)
        obj.assignee = (await CorpController.get(data.assignee._id)).asOwner
    if (data.relation?._id){
        const ctrl = institutionController(+data.relation.type)
        obj.relation = (await ctrl.get(data.relation._id)).asOwner
    }
    if (data.owners){
        const owners = []
        for (let k of data.owners){
            const owner = await institutionController(+k.type).get(k._id)
            const prev = obj.owners.find(o=>IDMatch(o._id, owner._id))
            owners.push(Object.assign({}, prev, owner.asOwner))
        }
        obj.owners = owners
    }
    if (data.captain?._id){
        const ctrl = institutionController(+data.captain.type);
        obj.captain = (await ctrl.get(data.captain._id)).asOwner
    }
    return obj
}
async function process_img(ctx: RenderContext, obj: AllInstControllers){
    if (!ctx.file)
        return
    // Save id to img name
    obj.img = obj._id
    const filename = config.static_dir+curls.Images.get(obj)
        .replace(config.static_url, '')
    await fs.writeFile(filename, ctx.file.buffer)
}

export class AdminApiRouter extends BaseRouter {
    async get_index(ctx: RenderContext){
        const {user}: {user: UserController} = ctx.state
        ctx.debug({all: ctx.params.all})
        return {user}
    }

    @CheckRole(UserType.Master)
    async get_items_list(ctx: RenderContext){
        return {list: await ItemController.all()}
    }

    @CheckRole(UserType.Master)
    async post_item_change(ctx: RenderContext){
        const {id} = ctx.params
        const params: any = ctx.request.body
        const {data = {}} = params
        let item = await ItemController.get(id)
        await process_data(item, data)
        // Patents adds problems
        if (item.type == ItemType.Patent){
            ((item as unknown) as Patent).owners.forEach(o=>
                o.status = o.status || PatentStatus.Created)
        }
        await item.save()
    }

    @CheckRole(UserType.Master)
    async delete_item(ctx: RenderContext){
        const {id} = ctx.params
        let item = await ItemController.get(id)
        if (!item)
            throw new ApiError(Codes.INCORRECT_PARAM, 'not_found')
        return await item.delete()
    }

    @CheckRole(UserType.Master)
    async get_orders_list(ctx: RenderContext){
        const list = await OrderController.all()
        return {list}
    }

    @CheckRole(UserType.Master)
    async post_order_change(ctx: RenderContext){
        const {id} = ctx.params
        const params: any = ctx.request.body
        const {data = {}} = params
        let item = await OrderController.get(id)
        await process_data(item, data)
        await item.save()
    }

    @CheckRole(UserType.Master)
    async delete_order(ctx: RenderContext){
        const {id} = ctx.params
        let order = await OrderController.get(id)
        if (!order)
            throw new ApiError(Codes.INCORRECT_PARAM, 'not_found')
        return await order.delete()
    }

    @CheckRole(UserType.Master)
    async post_user_add(ctx: RenderContext){
        const {data} = ctx.aparams
        if (!data.password || !data.email)
            throw new ApiError(Codes.INCORRECT_PARAM, 'missing_field')
        if (!/^[a-zA-Z0-9_.+-]+$/.test(data.email))
            throw new ApiError(Codes.INCORRECT_PARAM, 'email')
        if (data.phone && !util.isPhone(data.phone))
            throw new ApiError(Codes.INCORRECT_PARAM, 'phone')
        const user = await UserController.fromObj(data)
        if (user._id)
            delete user._id
        await user.save()  
    }

    @CheckRole(UserType.Master)
    async post_user_set(ctx: RenderContext){
        const {id} = ctx.aparams
        const user = await UserController.get(id)
        if (!user)
            throw new ApiError(Codes.INCORRECT_PARAM, 'not_found')
        const {data} = ctx.aparams
        if (data.email && !/^[a-zA-Z0-9_.+-]+$/.test(data.email))
            throw new ApiError(Codes.INCORRECT_PARAM, 'email')
        if (data.phone && !util.isPhone(data.phone))
            throw new ApiError(Codes.INCORRECT_PARAM, 'phone')
        await process_data(user, data)
        await process_img(ctx, user)
        if (data.password)
            user.password = await UserController.hash_password(data.password)
        await user.save()        
    }

    @CheckRole(UserType.Master)
    async get_entity_list(ctx: RenderContext){
        // Use CorpController since it shares corp db
        const list = await CorpController.all()
        return {list}
    }

    @CheckRole(UserType.Master)
    async post_entity_set(ctx: RenderContext){
        const {id, type, data} = ctx.aparams
        if (!data.name || !InstitutionType[+type])
            throw 'Should have name and type fields'
        if (+data.type == InstitutionType.User)
            throw 'Cannot change user with this method'
        if (data._id && data._id!=id)
            throw 'Cannot change id of item'
        const controller = institutionController(+type)
        const item = await controller.get(/^[a-f0-9]{12,24}$/.test(id) ? id : data)
        await process_data(item, data)
        await process_img(ctx, item)
        await item.save()
    }

    @CheckRole(UserType.Navigator)
    async get_planet_list(ctx: RenderContext){
        const list: Planet[] = await PlanetController.all()
        return {list}
    }

    @CheckRole(UserType.Master)
    async post_planet_set(ctx: RenderContext){
        const {id, data} = ctx.aparams
        if (!data.name || !Object.values(PlanetType).includes(data.type))
            throw 'Should have name and type fields'
        if (data._id && data._id!=id)
            throw 'Cannot change id of item'
        const item = await PlanetController.get(/^[a-f0-9]{12,24}$/.test(id) ? id : data)
        await process_data(item, data)
        await item.save()
    }
    
    @CheckRole(UserType.Master)
    async put_time(ctx: RenderContext){
        const params: any = ctx.request.body
        const {time} = params
        Time.basicTime += (+time)|0
    }

    @CheckRole(UserType.Master)
    async post_config(ctx: RenderContext){
        const params: any = ctx.request.body
        const {conf} = params
        await ConfigController.save(conf)
    }

}
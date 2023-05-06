import {BaseRouter, CheckRole} from '../base'
import {UserController, CorpController, PlanetController,
    ConfigController, institutionController, FlightController,
    InstitutionController, OrderController, ItemController, LogController} from '../../entity'
import {UserType, ItemType, InstitutionType,
    PlanetType, Planet, Owner, Location} from '../../../client/src/common/entity'
import {RenderContext} from '../../middlewares'
import {ApiError, Codes} from '../../../client/src/common/errors'
import {IDMatch, asID, isID} from '../../util/server'
import {Time} from '../../util/time'
import * as curls from '../../../client/src/common/urls'
import * as util from '../../../client/src/common/util'
import * as uutil from '../../util/user'
import config from '../../config'
import {promises as fs} from 'fs'

type AllControllers = (InstitutionController | ItemController | OrderController |
    FlightController | PlanetController) & {
    owner?: Owner
    relation?: Owner
    captain?: Owner
    owners?: Owner[]
    served?: Owner[]
    location?: Location
}
async function process_data(obj: AllControllers, data){
    const keys = (new obj.class()).keys
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
    if (data.relation?._id){
        const ctrl = institutionController(+data.relation.type)
        obj.relation = (await ctrl.get(data.relation._id)).asOwner
    }
    if (data.owners){
        const owners = []
        for (let k of data.owners)
            owners.push((await institutionController(+k.type).get(k._id)).asOwner)
        obj.owners = owners
    }
    if (data.served){
        const served = []
        for (let k of data.served)
            served.push((await institutionController(+k.type).get(k._id)).asOwner)
        obj.served = served
    }
    if (data.captain?._id){
        const ctrl = institutionController(+data.captain.type);
        obj.captain = (await ctrl.get(data.captain._id)).asOwner
    }
    return obj
}
async function process_img(ctx: RenderContext, obj: InstitutionController){
    if (!ctx.file)
        return
    // Save id to img name
    obj.img = asID(obj._id)
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
        const {id, data} = ctx.aparams
        if (!data.name || !ItemType[+data.type])
            throw 'Should have name and type fields'
        if (data._id && !IDMatch(data._id, id))
            throw 'Cannot change id of item'
        const item = await ItemController.get(isID(id) ? id : {})
        await process_data(item, data)
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
        const {id} = ctx.aparams
        const params: any = ctx.request.body
        const {data = {}} = params
        const item = await OrderController.get(isID(id) ? id : {})
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
        if (data.data)
            user.info = await uutil.process_data(data.data)
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
        if (data._id && !IDMatch(data._id, id))
            throw 'Cannot change id of item'
        const controller = institutionController(+type)
        const item = await controller.get(isID(id) ? id : data)
        await process_data(item, data)
        await process_img(ctx, item)
        await item.save()
    }

    @CheckRole(UserType.Master)
    async get_flight_list(ctx: RenderContext){
        const list = await FlightController.all()
        return {list}
    }

    @CheckRole(UserType.Master)
    async post_flight_change(ctx: RenderContext){
        const {id, data} = ctx.aparams
        if (!data.ts)
            throw 'Should specify time of the flight'
        if (data._id && !IDMatch(data._id, id))
            throw 'Cannot change id of item'
        const item = await FlightController.get(isID(id) ? id : {})
        await process_data(item, data)
        await item.save()
    }

    @CheckRole(UserType.Master)
    async delete_flight(ctx: RenderContext){
        const {id} = ctx.params
        let item = await FlightController.get(id)
        if (!item)
            throw new ApiError(Codes.INCORRECT_PARAM, 'not_found')
        return await item.delete()
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
        if (data._id && !IDMatch(data._id, id))
            throw 'Cannot change id of item'
        const item = await PlanetController.get(isID(id) ? id : data)
        await process_data(item, data)
        await item.save()
    }
    
    @CheckRole(UserType.Master)
    async put_time(ctx: RenderContext){
        const params: any = ctx.request.body
        const {time, cycleLength} = params
        Time.basicTime += (+time)|0
        Time.cycleLength = cycleLength
    }

    @CheckRole(UserType.Master)
    async post_config(ctx: RenderContext){
        const params: any = ctx.request.body
        const {conf} = params
        await ConfigController.save(conf)
    }

    @CheckRole(UserType.Master)
    async get_log_list(ctx: RenderContext){
        const list = await LogController.all()
        return {list}
    }

    @CheckRole(UserType.Master)
    async post_log(ctx: RenderContext){

    }
    
    @CheckRole(UserType.Master)
    async delete_log(ctx: RenderContext){
        
    }   

}
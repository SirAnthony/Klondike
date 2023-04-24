import {BaseRouter, CheckRole} from '../base'
import {UserController, CorpController, PlanetController, ConfigController, institutionController} from '../../entity'
import {OrderController, ItemController} from '../../entity'
import {UserType, PatentOwner, PatentStatus} from '../../../client/src/common/entity'
import {RenderContext} from '../../middlewares'
import {ApiError, Codes} from '../../../client/src/common/errors'
import {Time} from '../../util/time'
import * as util from '../../../client/src/common/util'

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
        for (let k in data)
            item[k] = data[k]
        if (data.owner)
        {
            const owner = Object.assign({type: data.owner.type},
                (await CorpController.get(data.owner._id)).identifier)
            item.owner = owner
        }
        if (data.location)
            item.location = (await PlanetController.get(data.location._id)).location(data.location.pos)
        if (data.owners){
            const owners: PatentOwner[] = []
            for (let k of data.owners){
                let owner = (await CorpController.get(k._id)).identifier
                owners.push(Object.assign({status: PatentStatus.Created,
                    type: k.type}, owner))
            }
            (item as any).owners = owners
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
        for (let k in data)
            item[k] = data[k]
        if (data.assignee?._id)
            item.assignee = (await CorpController.get(data.assignee._id)).asOwner
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
        for (let k in data)
            user[k] = data[k]
        if (user.relation){
            const ctrl = institutionController(user.relation.type)
            user.relation = (await ctrl.get(user.relation._id)).asOwner
        }
        if (user.password)
            user.password = await UserController.hash_password(data.password)
        await user.save()        
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
import {BaseRouter, CheckRole} from '../base'
import {UserController, CorpController, PlanetController} from '../../entity'
import {OrderController, ItemController, ResourceController} from '../../entity'
import {ItemType, UserType, Resource} from '../../../client/src/common/entity'
import {RenderContext} from '../../middlewares'
import * as server_util from '../../util/server'
import {ApiError, Codes} from '../../../client/src/common/errors'

export class AdminApiRouter extends BaseRouter {
    async get_index(ctx: RenderContext){
        const {user}: {user: UserController} = ctx.state
        ctx.debug({all: ctx.params.all})
        return {user}
    }

    @CheckRole(UserType.Master)
    async get_items_list(ctx: RenderContext){
        const list = await ItemController.all()
        const resources = await ResourceController.all()
        return {list, resources}
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
            item.owner = (await CorpController.get(data.owner._id)).identifier
        if (data.location)
            item.location = (await PlanetController.get(data.location._id)).location(data.location.pos)
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
    async post_resource_change(ctx: RenderContext){
        const {id} = ctx.params
        const params: any = ctx.request.body
        const {data = {}} = params
        let item = await ResourceController.get(id)
        for (let k in data)
            item[k] = data[k]
        await item.save()
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
            item.assignee = (await CorpController.get(data.assignee._id)).identifier
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
}
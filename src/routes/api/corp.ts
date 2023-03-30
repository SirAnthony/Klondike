import {BaseRouter, CheckRole} from '../base'
import {UserController, CorpController} from '../../entity'
import {ResourceController, OrderController, ItemController} from '../../entity'
import {Item, ItemType, UserType, Resource, Order} from '../../../client/src/common/entity'
import {CorporationType, PatentStatus} from '../../../client/src/common/entity'
import {RenderContext} from '../../middlewares'
import * as server_util from '../../util/server'
import {ApiError, Codes} from '../../../client/src/common/errors'

export class CorpApiRouter extends BaseRouter {
    async get_index(ctx: RenderContext){
        const {user}: {user: UserController} = ctx.state
        ctx.debug({all: ctx.params.all})
        return {user}
    }

    @CheckRole(UserType.Corporant)
    async get_corp(ctx: RenderContext){
        const {id} = ctx.params;
        const {user}: {user: UserController} = ctx.state
        const corp = await CorpController.get(id)
        return {corp}
    }

    @CheckRole(UserType.Corporant)
    async get_items(ctx: RenderContext) {
        const {id} = ctx.params;
        if (!id)
            throw 'Self-items not implemented'
        const corp = await CorpController.get(id)
        const items = await ItemController.all({'owner._id': corp._id})
        return {items}
    }

    @CheckRole(UserType.Corporant)
    async get_prices(ctx: RenderContext){
        const prices = {}
        const res = await ResourceController.all()
        for (let k of res)
            prices[k.kind] = k.price
        const corps = await CorpController.all()
        const res_filter = f=>f.type == ItemType.Resource
        const items: Item[] = await ItemController.all()
        let resources: Resource[] = items.filter(res_filter).map(f=>f as Resource)
        for (let item of resources)
            prices[item.kind] = (prices[item.kind]+item.price)/2
        return {prices}
    }

    @CheckRole(UserType.Corporant)
    async get_orders(ctx: RenderContext){
        const {id} = ctx.params
        if (!id)
            throw 'Self-items not implemented'
        const corp = await CorpController.get(id)
        const orders = await OrderController.all({'assignee._id': corp._id})
        return {orders}
    }
    
    @CheckRole(UserType.Corporant)
    async get_patents(ctx: RenderContext){
        const {id} = ctx.params
        if (!id)
            throw 'Self-patents not implemented'
        const corp = await CorpController.get(id)
        const status = corp.type == CorporationType.Research ?
            PatentStatus.Created :
            {'$in': [PatentStatus.Ready, PatentStatus.Served]}
        const patents = await ItemController.all({type: ItemType.Patent,
            'owners._id': corp._id, status})
        return {patents}
    }

    @CheckRole(UserType.Master)
    async get_list(ctx: RenderContext){
        const list = await CorpController.all()
        return {list}
    }
}
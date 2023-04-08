import {BaseRouter, CheckRole} from '../base'
import {UserController, CorpController} from '../../entity'
import {ResourceController, OrderController, ItemController} from '../../entity'
import {Item, ItemType, UserType, Resource, Order} from '../../../client/src/common/entity'
import {Patent, PatentStatus} from '../../../client/src/common/entity'
import {CorporationType, CorporationPointsType} from '../../../client/src/common/entity'
import {RenderContext} from '../../middlewares'
import * as server_util from '../../util/server'
import {Time} from '../../util/time'
import {ApiError, Codes} from '../../../client/src/common/errors'

const POINTS_FOR_PATENT = 100

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
    async post_transfer(ctx: RenderContext){
        const params: any = ctx.request.body
        const {owner, target, amount} = params
        const src = await CorpController.get(owner)
        const dst = await CorpController.get(target)
        if (src._id==dst._id || amount<0 || amount>src.credit)
            throw 'field_error_invalid'
        src.credit -= amount
        dst.credit += amount
        await src.save()
        await dst.save()
        return {credit: src.credit}
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
        const filter: any = {type: ItemType.Patent}
        if (corp.type==CorporationType.Research)
            filter['owners.status'] = {$in: [PatentStatus.Created, undefined]}
        else {
            Object.assign(filter, {'owners._id': corp._id,
                'owners.status': {$exists: true, '$ne': PatentStatus.Created}})
        }
        const patents = await ItemController.all(filter)
        return {patents}
    }

    @CheckRole(UserType.Corporant)
    async post_patent_forward(ctx: RenderContext){
        const params: any = ctx.request.body
        const {id, requester} = params
        if (!id || !requester)
            throw 'Required fields missing'
        const item = await ItemController.get(id)
        const patent = new Patent(item)
        const owner = await CorpController.get(requester)
        if (!patent.owners.some(o=>o._id==owner._id))
            throw new ApiError(Codes.WRONG_USER, 'Not an owner')
        const parts = patent.owners.filter(o=>o._id==owner._id)
        const ready = parts.filter(p=>p.status==PatentStatus.Ready);
        // Serve parts
        ((item as any) as Patent).owners.forEach(o=>{
            if (o._id==owner._id)
                o.status = PatentStatus.Served
        })
        await item.save()
        // Calcluate points
        const points = ready.length != parts.length ? 0 :
            POINTS_FOR_PATENT*ready.length/patent.owners.length
        if (points){
            owner.points = (owner.points||[]) as any
            let pts = owner.points
            pts.push({time: Time.basicTime,
                type: patent.fullOwnership ?
                    CorporationPointsType.PatentFull :
                    CorporationPointsType.PatentPart,
                value: points})
            await owner.save()
        }
    }

    @CheckRole(UserType.Master)
    async get_list(ctx: RenderContext){
        const list = await CorpController.all()
        return {list}
    }
}
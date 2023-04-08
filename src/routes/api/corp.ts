import {BaseRouter, CheckRole, CheckIDParam} from '../base'
import {UserController, CorpController} from '../../entity'
import {ResourceController, OrderController, ItemController} from '../../entity'
import {Item, ItemType, UserType, Resource, Order} from '../../../client/src/common/entity'
import {Patent, PatentStatus} from '../../../client/src/common/entity'
import {CorporationType, CorporationPointsType} from '../../../client/src/common/entity'
import {RenderContext} from '../../middlewares'
import {IDMatch} from '../../util/server'
import {Time} from '../../util/time'
import {ApiError, Codes} from '../../../client/src/common/errors'

const POINTS_FOR_PATENT = 100

export class CorpApiRouter extends BaseRouter {
    async get_index(ctx: RenderContext){
        const {user}: {user: UserController} = ctx.state
        ctx.debug({all: ctx.params.all})
        return {user}
    }

    @CheckIDParam()
    @CheckRole(UserType.Corporant)
    async get_corp(ctx: RenderContext){
        const {id} = ctx.params;
        const {user}: {user: UserController} = ctx.state
        const corp = await CorpController.get(id)
        return {corp}
    }

    @CheckIDParam()
    @CheckRole(UserType.Corporant)
    async get_items(ctx: RenderContext) {
        const {id} = ctx.params;
        const corp = await CorpController.get(id)
        const list = await ItemController.all({'owner._id': corp._id})
        return {list}
    }

    @CheckIDParam()
    @CheckRole(UserType.Corporant)
    async post_transfer(ctx: RenderContext){
        const {id} = ctx.params
        const params: any = ctx.request.body
        const {target, amount} = params
        const src = await CorpController.get(id)
        const dst = await CorpController.get(target)
        if (IDMatch(src._id, dst._id) || amount<0 || amount>src.credit)
            throw 'field_error_invalid'
        src.credit -= amount
        dst.credit += amount
        await src.save()
        await dst.save()
        return {credit: src.credit}
    }

    @CheckIDParam()
    @CheckRole(UserType.Corporant)
    async get_orders(ctx: RenderContext){
        const {id} = ctx.params
        const corp = await CorpController.get(id)
        const list = await OrderController.all({'assignee._id': corp._id})
        return {list}
    }
    
    @CheckIDParam()
    @CheckRole(UserType.Corporant)
    async get_patents(ctx: RenderContext){
        const {id} = ctx.params
        const corp = await CorpController.get(id)
        const filter: any = {type: ItemType.Patent}
        if (corp.type==CorporationType.Research)
            filter['owners.status'] = {$in: [PatentStatus.Created, undefined]}
        else {
            Object.assign(filter, {'owners._id': corp._id,
                'owners.status': {$exists: true, '$ne': PatentStatus.Created}})
        }
        const list = await ItemController.all(filter)
        return {list}
    }

    @CheckIDParam()
    @CheckRole(UserType.Scientist)
    async put_item_pay(ctx: RenderContext){
        const {id, item, target} = ctx.params
        if (!item || !target)
            throw 'Required fields missing'
        const corp = await CorpController.get(id)
        const resource = await ItemController.get(item)
        const patent = await ItemController.get(target)
        if (!IDMatch(resource.owner._id, corp._id))
            throw 'Wrong owner of resource'
        const res = (resource as unknown) as Resource
        const pt = (patent as unknown) as Patent
        let used = false
        for (let k of pt.resourceCost){
            if (!res.value)
                break
            if (k.kind!=res.kind || k.value<=k.provided)
                continue
            let amount = Math.min(res.value, k.value-(k.provided|0))
            k.provided = (k.provided|0) + amount
            res.value -= amount
            used = true
        }
        // Resource is single-used
        if (used)
            res.value = 0
        // Should delete?
        await resource.save()
        await patent.save()
    }

    @CheckIDParam()
    @CheckRole(UserType.Corporant)
    async post_patent_forward(ctx: RenderContext){
        const {id} = ctx.params
        const params: any = ctx.request.body
        const {requester} = params
        if (!id || !requester)
            throw 'Required fields missing'
        const item = await ItemController.get(id)
        const patent = new Patent(item)
        const owner = await CorpController.get(requester)
        if (!patent.owners.some(o=>IDMatch(o._id, owner._id)))
            throw new ApiError(Codes.WRONG_USER, 'Not an owner')
        const parts = patent.owners.filter(o=>IDMatch(o._id, owner._id))
        const ready = parts.filter(p=>p.status==PatentStatus.Ready);
        // Serve parts
        ((item as any) as Patent).owners.forEach(o=>{
            if (IDMatch(o._id, owner._id))
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
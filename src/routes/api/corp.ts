import {BaseRouter, CheckRole, CheckIDParam} from '../base'
import {UserController, CorpController} from '../../entity'
import {OrderController, ItemController} from '../../entity'
import {institutionController, LogController} from '../../entity'
import {ItemType, UserType, Resource} from '../../../client/src/common/entity'
import {Patent, PatentStatus} from '../../../client/src/common/entity'
import {InstitutionType, LogAction} from '../../../client/src/common/entity'
import {RenderContext} from '../../middlewares'
import {IDMatch} from '../../util/server'
import {ApiError, Codes} from '../../../client/src/common/errors'

const POINTS_FOR_PATENT = 100
const POINTS_FOR_PATENT_PAY = 100

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
        const {stype, target, dtype, amount} = params
        const srcController = institutionController(stype)
        const dstController = institutionController(dtype)
        if (!srcController || !dstController)
            throw 'field_error_noempty'
        const src = await srcController.get(id)
        const dst = await dstController.get(target)
        if (!src || !dst)
            throw 'field_error_noempty'
        const value = amount|0
        if (IDMatch(src._id, dst._id) || value<=0 || value>src.credit)
            throw 'field_error_invalid'
        src.credit = (src.credit|0) - value
        dst.credit = (dst.credit|0) + value
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
        if (corp.type!=InstitutionType.Research) {
            Object.assign(filter, {'owners._id': corp._id,
                'owners.status': {$exists: true, '$ne': PatentStatus.Created}})
        }
        const list = await ItemController.all(filter)
        return {list}
    }

    @CheckIDParam()
    @CheckRole(UserType.Scientist)
    async put_item_pay(ctx: RenderContext){
        const {id, item, target} = ctx.aparams
        if (!item || !target)
            throw 'Required fields missing'
        const corp = await CorpController.get(id)
        const resource = await ItemController.get(item)
        const patent = await ItemController.get(target)
        if (!IDMatch(resource.owner._id, corp._id))
            throw 'Wrong owner of resource'
        const pt = (patent as unknown) as Patent
        pt.resourceCost.forEach(k=>k.provided |= 0)
        if (pt.owners.some(o=>o.status!=PatentStatus.Created)){
            pt.owners.forEach(o=>{
                if (o.status==PatentStatus.Created)
                    o.status = PatentStatus.Ready
            })
            await patent.save()
            throw 'Wrong patent status'
        }
        const res = (resource as unknown) as Resource
        let {value} = res
        for (let k of pt.resourceCost){
            if (!res.value)
                break
            if (k.kind!=res.kind || k.value<=k.provided)
                continue
            let amount = Math.min(res.value, k.value-k.provided)
            k.provided += amount
            res.value -= amount
        }
        // Resource is single-used
        if (value != res.value) {
            await LogController.log({
                name: 'resource_used', info: `post_patent_pay`,
                owner: corp.asOwner, item: res, points: 0,
                data: {value}, action: LogAction.ResourceUsed
            })
            res.value = 0
            // Should delete?
            await resource.save()
        }
        // Patent closed
        if (!pt.resourceCost.some(k=>k.provided<k.value)){
            pt.owners.forEach(o=>o.status=PatentStatus.Ready)
            const points = POINTS_FOR_PATENT_PAY
            await LogController.log({
                name: 'patent_pay', info: 'post_patent_pay',
                owner: corp.asOwner, item: patent, points,
                action: LogAction.PatentPaid
            })
        }
        await patent.save()
    }

    @CheckIDParam()
    @CheckRole(UserType.Corporant)
    async post_patent_forward(ctx: RenderContext){
        const {id, requester} = ctx.aparams
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
            await LogController.log({
                name: 'patent_forward', info: 'post_patent_forward',
                owner: owner.asOwner, points, item,
                action: patent.fullOwnership ?
                    LogAction.PatentForwardFull :
                    LogAction.PatentForwardPart,
            })
        }
    }

    @CheckRole(UserType.Master)
    async get_list(ctx: RenderContext){
        const {type} = ctx.aparams
        const controller = institutionController(+type)
        if (!controller)
            return {}
        const list = await controller.all({type: +type})
        return {list}
    }
}
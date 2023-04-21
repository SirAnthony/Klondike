import {BaseRouter, CheckRole, CheckIDParam} from '../base'
import {UserController, CorpController} from '../../entity'
import {OrderController, ItemController} from '../../entity'
import {institutionController, LogController} from '../../entity'
import {ItemType, UserType, Resource} from '../../../client/src/common/entity'
import {Patent, PatentStatus} from '../../../client/src/common/entity'
import {InstitutionType, LogAction} from '../../../client/src/common/entity'
import {ConfigController} from '../../entity'
import {RenderContext} from '../../middlewares'
import {IDMatch} from '../../util/server'
import {ApiError, Codes} from '../../../client/src/common/errors'
import {Rating} from '../../util/rating'
import defines from '../../defines'

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
        const conf = await ConfigController.get()
        const pts = conf.points.patent[patent.ownership][patent.weight]
        const points = ready.length != parts.length ? 0 :
            pts*ready.length/patent.owners.length
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
        const controller = type ?
            institutionController(+type) : CorpController
        if (!controller)
            return {}
        const filter = type ? {type: +type} : null
        const list = await controller.all(filter)
        return {list}
    }

    @CheckIDParam()
    @CheckRole(UserType.Corporant)
    async get_rating(ctx: RenderContext){
        return {rating: await Rating.get()}
    }
}
import {BaseRouter, CheckRole, CheckIDParam} from '../base'
import {UserController, CorpController} from '../../entity'
import {OrderController, ItemController} from '../../entity'
import {institutionController, LogController} from '../../entity'
import {UserType} from '../../../client/src/common/entity'
import {Patent, PatentStatus} from '../../../client/src/common/entity'
import {LogAction} from '../../../client/src/common/entity'
import {RenderContext} from '../../middlewares'
import {IDMatch} from '../../util/server'
import {ApiError, Codes} from '../../../client/src/common/errors'
import * as cutil from '../../../client/src/common/util'
import * as Rating from '../../util/rating'

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
    async get_orders(ctx: RenderContext){
        const {id} = ctx.params
        const corp = await CorpController.get(id)
        const list = await OrderController.all({'owner._id': corp._id})
        return {list}
    }

    @CheckIDParam()
    @CheckRole(UserType.Corporant)
    async post_patent_forward(ctx: RenderContext){
        const {id, requester} = ctx.aparams
        if (!id || !requester)
            throw 'Required fields missing'
        const item = await ItemController.get(id)
        const patent = item as unknown as Patent
        const owner = await CorpController.get(requester)
        if (!patent.owners.some(o=>IDMatch(o._id, owner._id)))
            throw new ApiError(Codes.WRONG_USER, 'Not an owner');
        const prevOwners = patent.owners.map(o=>Object.assign({}, o));
        // Serve parts
        patent.owners.forEach(o=>{
            if (IDMatch(o._id, owner._id))
                o.status = PatentStatus.Served
        })
        await item.save()
        // Calcluate points
        const points = await Rating.patent_points(patent, owner, prevOwners);
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

    @CheckRole([UserType.Captain, UserType.Corporant,
        UserType.Guard, UserType.Scientist])
    async get_list(ctx: RenderContext){
        const {stype} = ctx.aparams
        if (isNaN(+stype))
            throw 'No type provided'
        const controller = institutionController(+stype)
        if (!controller)
            return {}
        const list = await controller.all({type: +stype})
        return {list}
    }

    @CheckRole(UserType.Corporant)
    async get_rating(ctx: RenderContext){
        const rating = await Rating.Rating.get()
        return {rating}
    }
}
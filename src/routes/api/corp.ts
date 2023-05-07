import {BaseRouter, CheckRole, CheckIDParam, CheckAuthenticated} from '../base'
import {UserController, CorpController} from '../../entity'
import {OrderController, ItemController} from '../../entity'
import {institutionController} from '../../entity'
import {UserType, Patent, OwnerMatch} from '../../../client/src/common/entity'
import {RenderContext} from '../../middlewares'
import {asID} from '../../util/server'
import {ApiError, Codes} from '../../../client/src/common/errors'
import * as Rating from '../../util/rating'
import * as _ from 'lodash'
import {Time} from '../../util/time'

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
        const list = await OrderController.all({'owner._id': asID(corp._id)})
        const rating = await Rating.Rating.entity(corp.asOwner, Time.cycle)
        return {list, rating}
    }

    @CheckRole(UserType.Corporant)
    async post_patent_forward(ctx: RenderContext){
        const {id, requester} = ctx.aparams
        if (!id || !requester)
            throw 'Required fields missing'
        const item = await ItemController.get(id)
        const patent = item as unknown as Patent
        const owner = await CorpController.get(requester)
        if (!patent.owners.some(o=>OwnerMatch(o, owner)))
            throw new ApiError(Codes.WRONG_USER, 'Not an owner');
        // Serve parts
        const served = patent.served.slice()
        patent.served = _.uniqBy(patent.served.concat(owner.asOwner), f=>asID(f._id))
        await item.save()
        // Calcluate points
        await Rating.patent_points(item, owner, served);
    }

    @CheckAuthenticated()
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
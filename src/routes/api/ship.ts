import {BaseRouter, CheckRole} from '../base'
import {UserController, ShipController, FlightController} from '../../entity'
import {UserType} from '../../../client/src/common/entity'
import {RenderContext} from '../../middlewares'
import {Time} from '../../util/time'
import {ApiError, Codes} from '../../../client/src/common/errors'

export class ShipApiRouer extends BaseRouter {
    async get_index(ctx: RenderContext){
        const {user}: {user: UserController} = ctx.state
        ctx.debug({all: ctx.params.all})
        return {user}
    }

    @CheckRole([UserType.Mechanic, UserType.Captain, UserType.Corporant, UserType.Navigator])
    async get_ship(ctx: RenderContext){
        const {id} = ctx.params;
        const ship = await ShipController.get(id)
        return {ship}
    }

    @CheckRole([UserType.Corporant, UserType.Captain])
    async get_list(ctx: RenderContext){
        const {user}: {user: UserController} = ctx.state
        const filter = user.kind == UserType.Master ? {} :
            user.kind == UserType.Captain ? {'captain._id': user._id} :
            {'owner._id': user._id}
        const list = await ShipController.all(filter)
        return {list}
    }

    @CheckRole([UserType.Guard, UserType.Captain])
    async get_flights(ctx: RenderContext){
        const list = await FlightController.all({
            ts: Time.cycleInterval(Time.cycle)})
        return {list}
    }
}
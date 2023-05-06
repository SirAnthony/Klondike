import {BaseRouter, CheckRole} from '../base'
import {UserController, ShipController, FlightController, ItemController, LogController} from '../../entity'
import {FlightStatus, FlightType, ItemType, LogAction, Module, UserType, UserTypeIn} from '../../../client/src/common/entity'
import {RenderContext} from '../../middlewares'
import {IDMatch, asID, isID} from '../../util/server'
import * as Flights from '../../util/flights'
import * as date from '../../../client/src/common/date'
import { ObjectId } from 'mongodb'
import * as _ from 'lodash'

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
        const filter = UserTypeIn(user, UserType.Master) ? {} :
            UserTypeIn(user, UserType.Captain) ? {'captain._id': asID(user._id)} :
            {'owner._id': asID(user._id)}
        const list = await ShipController.all(filter)
        return {list}
    }

    @CheckRole([UserType.Guard, UserType.Captain, UserType.Scientist, UserType.Navigator])
    async get_flights(ctx: RenderContext){
        const d = new Date()
        const flights = await FlightController.all({$or: [
            {ts: {$gte: +date.add(d, {'min': -30}), $lt: +date.add(d, {'hour': 2})}},
            {status: {$ne: FlightStatus.Docked}, 'owner._id': {$exists: true}}
        ]})
        const ships = await ShipController.all({'flight._id': {$exists: true}})
        const ids = ships?.map(s=>(s._id as any) instanceof ObjectId ?
            s._id : new ObjectId(s._id))
        const active = ids.length ? await FlightController.all({'_id': {$in: ids}}) : []
        const list = _.uniqBy(active.concat(flights), f=>f._id).sort((a, b)=>a.ts-b.ts)
        return {list}
    }

    @CheckRole([UserType.Scientist, UserType.Guard, UserType.Captain])
    async put_flight_action(ctx: RenderContext){
        const {user}: {user: UserController} = ctx.state
        const {id, action, data} = ctx.aparams
        const flight = await FlightController.get(isID(id) ? id : data)
        if (!flight)
            throw 'Incorrect flight'
        let fn = Flights.Api[action] 
        if (!fn)
            throw `Incorrect request ${action}`
        await fn(user, flight, data)
        await LogController.log({
            name: 'flight_action', info: action,
            action: LogAction.FlightAction,
            owner: user.asOwner, data: flight
        })
    }

    @CheckRole(UserType.Guard | UserType.Captain | UserType.Mechanic)
    async get_modules_list(ctx: RenderContext){
        const {id} = ctx.aparams
        // From ship api only ship modules is available
        const owner = await ShipController.get(id)
        const list = await ItemController.all({type: ItemType.Module,
            'owner._id': asID(owner._id), 'owner.type': +owner.type})
        return {list}
    }

    @CheckRole(UserType.Mechanic)
    async put_module_install(ctx: RenderContext){
        const {id, mod} = ctx.aparams
        const ship = await ShipController.get(id)
        const item = await ItemController.get(mod)
        if (!ship || !mod)
            throw 'not_found'
        if (item.owner.type!=ship.type || !IDMatch(item.owner._id, ship._id))
            throw 'Cannot act on foreigh item'
        const active = await ItemController.all({type: ItemType.Module,
            'owner._id': asID(ship._id), 'owner.type': +ship.type, installed: true})
        if (active.length >= ship.slots)
            throw 'No space available'
        const flight = await FlightController.find({'owner._id': asID(ship._id),
            'owner.type': +ship.type, type: FlightType.Drone,
            status: {$ne: FlightStatus.Docked}});
        if (flight)
            throw 'error_drone_busy';
        ((item as unknown) as Module).installed = true
        await item.save()
    }

    @CheckRole(UserType.Mechanic)
    async put_module_remove(ctx: RenderContext){
        const {id, mod} = ctx.aparams
        const ship = await ShipController.get(id)
        const item = await ItemController.get(mod)
        if (!ship || !mod)
            throw 'not_found'
        if (item.owner.type!=ship.type || !IDMatch(item.owner._id, ship._id))
            throw 'Cannot act on foreigh item';
        const flight = await FlightController.find({'owner._id': asID(ship._id),
            'owner.type': +ship.type, type: FlightType.Drone,
            status: {$ne: FlightStatus.Docked}});
        if (flight)
            throw 'error_drone_busy';
        ((item as unknown) as Module).installed = false
        await item.save()
    }
}
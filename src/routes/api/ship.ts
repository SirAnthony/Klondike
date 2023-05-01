import {BaseRouter, CheckIDParam, CheckRole} from '../base'
import {UserController, ShipController, FlightController, ItemController} from '../../entity'
import {ItemType, Module, UserType} from '../../../client/src/common/entity'
import {RenderContext} from '../../middlewares'
import {Time} from '../../util/time'
import {IDMatch} from '../../util/server'
import * as date from '../../../client/src/common/date'

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
        const d = new Date()
        const list = await FlightController.all({
            ts: {$gte: +date.add(d, {'min': -30}), $lt: +date.add(d, {'hour': 2})}})
        return {list}
    }

    @CheckIDParam()
    @CheckRole([UserType.Guard, UserType.Captain])
    async put_flight_action(ctx: RenderContext){
        const {user}: {user: UserController} = ctx.state
        const {id, action} = ctx.aparams
        const flight = await FlightController.get(id)
        if (!flight)
            throw 'Incorrect flight'
        switch(action){
        }        
    }

    @CheckRole([UserType.Guard, UserType.Captain])
    async get_modules_list(ctx: RenderContext){
        const {id} = ctx.aparams
        // From ship api only ship modules is available
        const owner = await ShipController.get(id)
        const list = await ItemController.all({type: ItemType.Module,
            'owner._id': owner._id, 'owner.type': owner.type})
        return {list}
    }

    @CheckRole([UserType.Guard, UserType.Captain])
    async put_module_install(ctx: RenderContext){
        const {id, mod} = ctx.aparams
        const ship = await ShipController.get(id)
        const item = await ItemController.get(mod)
        if (!ship || !mod)
            throw 'not_found'
        if (item.owner.type!=ship.type || !IDMatch(item.owner._id, ship._id))
            throw 'Cannot act on foreigh item'
        const active = await ItemController.all({type: ItemType.Module,
            'owner._id': ship._id, 'owner.type': ship.type, installed: true})
        if (active.length >= ship.slots)
            throw 'No space available';
        ((item as unknown) as Module).installed = true
        await item.save()
    }

    @CheckRole([UserType.Guard, UserType.Captain])
    async put_module_remove(ctx: RenderContext){
        const {id, mod} = ctx.aparams
        const ship = await ShipController.get(id)
        const item = await ItemController.get(mod)
        if (!ship || !mod)
            throw 'not_found'
        if (item.owner.type!=ship.type || !IDMatch(item.owner._id, ship._id))
            throw 'Cannot act on foreigh item';
        ((item as unknown) as Module).installed = false
        await item.save()
    }
}
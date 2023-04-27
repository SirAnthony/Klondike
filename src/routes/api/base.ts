import {BaseRouter, CheckAuthenticated, CheckRole} from '../base'
import {UserController, ShipController, institutionController} from '../../entity'
import {ItemController, PlanetController} from '../../entity'
import {ConfigController, LogController} from '../../entity'
import {PlanetInfo, UserType, LogAction} from '../../../client/src/common/entity'
import {ItemType, Resource} from '../../../client/src/common/entity'
import {RenderContext} from '../../middlewares'
import * as server_util from '../../util/server'
import * as cutil from '../../util/config'
import {Time} from '../../util/time'
import {ObjectId} from 'mongodb';

export class ApiRouter extends BaseRouter {
    async get_index(ctx: RenderContext){
        const {user}: {user: UserController} = ctx.state
        ctx.debug({all: ctx.params.all})
        return {user}
    }

    async get_time(ctx: RenderContext){
        return Time
    }

    // TODO: no checks at all
    @CheckAuthenticated()
    async get_item(ctx: RenderContext){
        const {id} = ctx.aparams
        return await ItemController.get(id)
    }

    @CheckRole(UserType.Navigator)
    async get_planet(ctx: RenderContext){
        const {id} = ctx.params;
        const {user}: {user: UserController} = ctx.state
        const planet: PlanetInfo = await PlanetController.get(id)
        const ships = await ShipController.all({'location._id': new ObjectId(id)})
        planet.ships = ships.map(s=>s.PlanetShip)
        return {planet, date: server_util.currentDate()}
    }

    @CheckRole(UserType.Navigator)
    async get_planet_list(ctx: RenderContext){
        const list: PlanetInfo[] = await PlanetController.all()
        for (let p of list) {
            p.items = await ItemController.all({'location._id': p._id})
            // p.ships = await ShipController.all({'location._id': p._id})
        }
        return {list}
    }

    @CheckRole(UserType.Navigator)
    async get_planet_list_short(ctx: RenderContext){
        const planets = await PlanetController.all()
        const list = planets.map(p=>({_id: p._id, name: p.name}))
        return {list}
    }

    @CheckRole([UserType.Corporant, UserType.Captain, UserType.Scientist])
    async get_prices(ctx: RenderContext){
        const prices = await cutil.get_prices()
        return {list: prices}
    }

    @CheckRole([UserType.Corporant, UserType.Captain, UserType.Scientist])
    async get_balance(ctx: RenderContext){
        const {user}: {user: UserController} = ctx.state
        const {relation} = user
        let entity = null
        if (relation){
            const srcController = institutionController(relation.type)
            const src = await srcController.get(relation._id)
            entity = Object.assign({credit: src.credit}, src.asOwner)
        }
        return {user: user.credit, entity}
    }

    @CheckRole(UserType.Master)
    async get_users_list(ctx: RenderContext){
        const list = await UserController.all()
        return {list}
    }

    async get_config(ctx: RenderContext){
        return await ConfigController.get()
    }
}
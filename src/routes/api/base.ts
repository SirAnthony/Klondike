import {BaseRouter, CheckAuthenticated, CheckRole} from '../base'
import {UserController, ShipController, ItemController, institutionController} from '../../entity'
import {PlanetController, ResourceController} from '../../entity'
import {ConfigController} from '../../entity'
import {PlanetInfo, UserType} from '../../../client/src/common/entity'
import {ItemType, Item, Resource} from '../../../client/src/common/entity'
import {RenderContext} from '../../middlewares'
import * as server_util from '../../util/server'
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

    @CheckRole(UserType.Corporant)
    async get_prices(ctx: RenderContext){
        const prices = {}
        const res = await ResourceController.all()
        for (let k of res)
            prices[k.kind] = k.price
        const res_filter = f=>f.type == ItemType.Resource
        const items: Item[] = await ItemController.all()
        let resources: Resource[] = items.filter(res_filter).map(f=>f as Resource)
        for (let item of resources)
            prices[item.kind] = (prices[item.kind]+(item.price||prices[item.kind]))/2
        return {list: prices}
    }

    @CheckAuthenticated()
    async get_balance(ctx: RenderContext){
        const {user}: {user: UserController} = ctx.state
        const {relation} = user
        let institution = null
        if (relation){
            const srcController = institutionController(relation.type)
            const src = await srcController.get(relation._id)
            institution = src.credit
        }
        return {user: user.credit, relation, institution}
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
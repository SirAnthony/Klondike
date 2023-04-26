import {BaseRouter, CheckAuthenticated, CheckRole} from '../base'
import {UserController, ShipController, ItemController, institutionController, LogController, LoanController} from '../../entity'
import {PlanetController} from '../../entity'
import {ConfigController} from '../../entity'
import {PlanetInfo, UserType, LogAction} from '../../../client/src/common/entity'
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
        const conf = await ConfigController.get()
        const cycle = Time.cycle
        const res = conf.price.res[cycle]
        for (let k in res)
            prices[k] = res[k]
        const entries = await LogController.all({'item.type': ItemType.Resource,
            action: LogAction.ItemPurchase, ts: Time.cycleInterval(cycle)})
        for (let l of entries){
            const res = l.item as Resource
            prices[res.kind] = (prices[res.kind]+(res.price/res.value||prices[res.kind]))/2
        }
        return {list: prices}
    }

    @CheckAuthenticated()
    async get_balance(ctx: RenderContext){
        const {user}: {user: UserController} = ctx.state
        const {relation} = user
        let loans = null, entity = null
        if (relation){
            const srcController = institutionController(relation.type)
            const src = await srcController.get(relation._id)
            entity = Object.assign({
                credit: src.credit,
                cost: src.cost
            }, relation)
            loans = await LoanController.all({
                filled: {$ne: true}, $or: [
                    {'lender._id': src._id, 'lender.type': src.type},
                    {'creditor._id': src._id, 'creditor.type': src.type},
                ]
            })
        }
        return {user: user.credit, entity, loans}
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
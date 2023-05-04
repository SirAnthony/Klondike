import {BaseRouter, CheckAuthenticated, CheckRole} from '../base'
import {UserController, ShipController, institutionController} from '../../entity'
import {ItemController, PlanetController} from '../../entity'
import {ConfigController} from '../../entity'
import {InstitutionType, PlanetInfo, UserType, UserTypeIn} from '../../../client/src/common/entity'
import {ItemType} from '../../../client/src/common/entity'
import {RenderContext} from '../../middlewares'
import {asID} from '../../util/server'
import * as cutil from '../../util/config'
import {Time} from '../../util/time'

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

    @CheckAuthenticated()
    async get_planet(ctx: RenderContext){
        const {id} = ctx.params;
        const {user}: {user: UserController} = ctx.state
        const entity = await institutionController(user.relation?.type)?.get(user.relation?._id)
        const planet: PlanetInfo = await PlanetController.get(id)
        const opt_owner = UserTypeIn(user, UserType.Master) ? {} :
             {'owner._id': asID(entity._id), 'owner.type': entity.type}
        const opt = {'location._id': asID(planet._id),
            'type': {$in: [ItemType.Resource, ItemType.Coordinates]}}
        const items = await ItemController.all({$or: [{...opt_owner, ...opt},
            {'owners._id': asID(entity._id), 'owners.type': entity.type},
            {'known': true, ...opt}]})
        const ships = UserTypeIn(user, UserType.Master) ?
            await ShipController.all({'location._id': asID(planet._id)}) :
            user.relation.type == InstitutionType.Ship ? [entity] : []
        planet.items = items
        planet.ships = ships.map(s=>ShipController.PlanetShip(s))
        return {item: planet, entity}
    }

    @CheckAuthenticated()
    async get_planet_list(ctx: RenderContext){
        return {list: await PlanetController.all()}
    }

    @CheckAuthenticated()
    async get_planet_list_short(ctx: RenderContext){
        const planets = await PlanetController.all()
        const list = planets.map(p=>({_id: asID(p._id), name: p.name, system: p.system, zones: p.zones}))
        return {list}
    }

    @CheckAuthenticated()
    async get_prices(ctx: RenderContext){
        const prices = await cutil.get_prices()
        return {list: prices}
    }

    @CheckAuthenticated()
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
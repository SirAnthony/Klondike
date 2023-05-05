import {BaseRouter, CheckAuthenticated, CheckRole} from '../base'
import {UserController, ShipController, institutionController, FlightController} from '../../entity'
import {ItemController, PlanetController} from '../../entity'
import {ConfigController} from '../../entity'
import {Flight, FlightStatus, FlightType, InstitutionType, OwnerMatch, PlanetInfo} from '../../../client/src/common/entity'
import {ItemType, UserType, UserTypeIn} from '../../../client/src/common/entity'
import {RenderContext} from '../../middlewares'
import {IDMatch, asID} from '../../util/server'
import {Time} from '../../util/time'
import * as util from '../../../client/src/common/util'
import * as cutil from '../../util/config'

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

    // TODO: might be used by non-related users
    @CheckAuthenticated()
    async get_planet(ctx: RenderContext){
        const {id} = ctx.params;
        const {user}: {user: UserController} = ctx.state
        const entity = await institutionController(user.relation?.type)?.get(user.relation?._id)
        const planet: PlanetInfo = await PlanetController.get(id)
        const loc_opt = {'location._id': asID(planet._id)}
        // Additional all-viewing filter
        const view = UserTypeIn(user, UserType.Master) ? [{...loc_opt}] : [] as any
        if (entity){
            view.push({type: ItemType.Coordinates, ...loc_opt,
                'owners._id': asID(entity?._id), 'owners.type': entity?.type})
        }
        const items = await ItemController.all({$or: [
            {type: ItemType.Resource, 'owner._id': {$ne: null}, ...loc_opt},
            {type: ItemType.Resource, 'owner._id': {exists: true}, ...loc_opt},
            ...view
        ]})
        const full_view = UserTypeIn(user, UserType.Master)
        const ships = full_view ?
            await ShipController.all({'location._id': asID(planet._id)}) :
            user.relation.type == InstitutionType.Ship &&
            (entity as unknown as ShipController).location?._id == planet._id ? [entity] : []
        planet.items = items
        planet.ships = ships.map(s=>ShipController.PlanetShip(s))
        const flights = await FlightController.all({type: FlightType.Drone,
            status: {$in: [FlightStatus.InFlight, FlightStatus.Research]},
            ...loc_opt, ...(full_view ? {} :
            {'owner._id': asID(entity._id), 'owner.type': entity.type})
        })
        for (let flight of flights as Flight[]){
            if (!flight.owner)
                continue
            const prev = planet.ships.find(k=>OwnerMatch(k, flight.owner))
            if (prev) {
                prev.flightKind = flight.kind
                prev.flightType = flight.type
                prev.status = flight.status
            } else {
                const ship = await ShipController.get(flight.owner._id)
                planet.ships.push({...ShipController.PlanetShip(ship),
                    flightType: flight.type, flightKind: flight.kind,
                    status: flight.status, location: flight.location,
                    points: flight.points})
            }
        }
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
import {
    Flight, FlightKind, FlightStatus, FlightType, ID, InstitutionType,
    ItemType, Module,
    LogAction, OwnerMatch, UserType, UserTypeIn, ModStat, Resource, Coordinates
} from "../../client/src/common/entity";
import {ConfigController, FlightController, ItemController, LogController, ShipController, UserController} from "../entity";
import * as date from '../../client/src/common/date'
import { IDMatch, asID } from "./server";
import * as uutil from './user'
import { ApiError, Codes } from "../../client/src/common/errors";
import * as utime from './time'
import * as mutil from '../../client/src/common/map'
import { ObjectId } from "mongodb";
import * as _ from 'lodash'

export namespace Util {
export const isFlightType = (k: FlightType, t: FlightType)=>((+k) & t) == t

export async function checkShipAvailable(ship: ShipController, flight?: ID){
    if (!ship.flight)
        return true
    if (IDMatch(ship.flight._id, flight?._id))
        return false
    const fl = await FlightController.find({'_id': new ObjectId(ship.flight._id)})
    if (fl && IDMatch(ship._id, fl.owner?._id))
        return false
    ship.flight = null
    await ship.save()
    return true 
}
}

export namespace Api {
const isType = Util.isFlightType

function CheckFlightStatus(statuses: FlightStatus[]){
    return (target: Object, key: string, descriptor: TypedPropertyDescriptor<any>)=>{
        return {...descriptor, value: async function check(user: UserController, flight: FlightController, ...args: any[]){
            if (statuses.length && !statuses.includes(+flight.status))
                throw new ApiError(Codes.INCORRECT_PARAM, 'error_forbidden_action')
            return descriptor.value.apply(this, arguments)
        }}
    }
}

uutil.CheckRole(UserType.Captain)
CheckFlightStatus([FlightStatus.Docked])
export async function signup(user: UserController, flight: FlightController){
    const rel = user.relation
    if (!rel?._id || +rel?.type != InstitutionType.Ship)
        throw 'error_no_ship'
    if (!FlightStatus[+flight.type] || !+flight.ts)
        throw 'Insufficient data'
    if (isType(flight.type, FlightType.Drone))
        throw 'Cannot control drone flights with this'
    if (FlightStatus[+flight.status] && +flight.status!=FlightStatus.Docked)
        throw 'error_slot_busy'
    const ship = await ShipController.get(rel._id)
    if (isType(flight.type, FlightType.Planetary) && ship.credit<=0)
        throw 'error_no_funds'
    await Actions.signupFlight(flight, user)
    await LogController.log({
        name: 'flight_signup', info: 'flight_signup',
        action: LogAction.FlightSignup, flight,
        owner: user.asOwner, institution: ship.asOwner})
}

uutil.CheckRole(UserType.Captain)
CheckFlightStatus([FlightStatus.Docked, FlightStatus.InFlight, FlightStatus.InFlight])
export async function drone_signup(user: UserController, flight: FlightController, data: Flight){
    const rel = user.relation
    if (!rel?._id || +rel?.type != InstitutionType.Ship)
        throw 'error_no_ship'
    if (!FlightStatus[+flight.type] || !+flight.ts)
        throw 'Insufficient data'
    if (!isType(flight.type, FlightType.Drone))
        throw 'Cannot control non-drone flight by this'
    if (!(flight.points?.length || data?.points?.length) || !flight.ts)
         throw 'Points or time not specified'

    const ship = await ShipController.get(rel._id)
    const prev = await FlightController.find({type: FlightType.Drone,
        status: {$ne: FlightStatus.Docked}, 'owner._id': asID(ship._id),
        'owner.type': ship.type})
    if (prev && !IDMatch(flight._id, prev._id))
        throw 'error_ship_busy'

    if (!prev)
        await Actions.signupFlight(flight, user)
    else
        flight.points = data.points
    
    await flight.save()
    await LogController.log({
        name: 'flight_signup', info: 'flight_signup',
        action: LogAction.FlightSignup, flight,
        owner: user.asOwner, institution: ship.asOwner})
}

uutil.CheckRole(UserType.Captain)
CheckFlightStatus([FlightStatus.Waiting])
export async function delist(user: UserController, flight: FlightController){
    const rel = flight.owner
    if (!rel?._id || +rel?.type != InstitutionType.Ship)
        throw 'error_no_ship'
    if (!UserTypeIn(user, UserType.Master) && !OwnerMatch(user.relation, rel))
        throw 'Cannot control foreign flight'
    if (+flight.status!=FlightStatus.Waiting)
        throw 'Cannot delist from started flight'
    const prev = {...flight} as undefined as Flight
    await Actions.cleanFlight(flight)
    await LogController.log({
        name: 'flight_delist', info: 'flight_delist',
        action: LogAction.FlightDelist, flight: prev,
        owner: user.asOwner, data: flight})
}

uutil.CheckRole(UserType.Captain)
CheckFlightStatus([FlightStatus.Waiting])
export async function retrive(user: UserController, flight: FlightController){
    const rel = flight.owner
    if (!rel?._id || +rel?.type != InstitutionType.Ship)
        throw 'error_no_ship'
    if (!UserTypeIn(user, UserType.Master) && !OwnerMatch(user.relation, rel))
        throw 'Cannot control foreign flight'
    if (+flight.type!=FlightType.Drone)
        throw 'Cannot retrive non-drone flight'
    if (![FlightStatus.InFlight, FlightStatus.Research].includes(+flight.status))
        throw 'error_forbidden_action'
    const prev = {...flight} as undefined as Flight
    await Actions.dockFlight(flight);
    await LogController.log({
        name: 'flight_delist', info: 'flight_delist',
        action: LogAction.FlightDelist, flight: prev,
        owner: user.asOwner, data: flight})
}

uutil.CheckRole(UserType.Guard)
CheckFlightStatus([FlightStatus.Docked, FlightStatus.Waiting])
export async function block(user: UserController, flight: FlightController){
    const rel = flight.owner
    if (!rel?._id || +rel?.type != InstitutionType.Ship)
        throw 'error_no_ship'
    const prev = {...flight} as undefined as Flight
    const ship = await ShipController.get(rel._id)
    flight.status = FlightStatus.Blocked
    flight.name = Flight.Name(flight)
    flight.arrival = flight.departure = null
    await flight.save()
    if (!ship.flight || !IDMatch(ship.flight._id, flight._id)){
        ship.flight = flight.identifier
        ship.save()
    }
    await LogController.log({
        name: 'flight_block', info: 'flight_block',
        action: LogAction.FlightBlock, flight: prev,
        owner: user.asOwner, institution: ship.asOwner
    })
}

uutil.CheckRole(UserType.Guard)
CheckFlightStatus([FlightStatus.Blocked])
export async function unblock(user: UserController, flight: FlightController){
    const rel = flight.owner
    if (!rel?._id || +rel?.type != InstitutionType.Ship)
        throw 'error_no_ship'
    const prev = {...flight} as undefined as Flight
    const ship = await ShipController.get(rel._id)
    flight.status = FlightStatus.Waiting
    flight.name = Flight.Name(flight)
    flight.arrival = flight.departure = null
    await flight.save()
    if (!ship.flight || !IDMatch(ship.flight._id, flight._id)){
        ship.flight = flight.identifier
        ship.save()
    }
    await LogController.log({
        name: 'flight_unblock', info: 'flight_unblock',
        action: LogAction.FlightUnblock, flight: prev,
        owner: user.asOwner, institution: ship.asOwner
    })
}

uutil.CheckRole(UserType.Master)
CheckFlightStatus([FlightStatus.Waiting])
export async function departure(user: UserController, flight: FlightController){
    const rel = flight.owner
    if (!rel?._id || +rel?.type != InstitutionType.Ship)
        throw 'error_no_ship'
    const prev = {...flight} as undefined as Flight
    const ship = await ShipController.get(rel._id)
    flight.status = FlightStatus.InFlight
    flight.name = Flight.Name(flight)
    flight.departure = +(new Date())
    flight.arrival = null
    await flight.save()
    if (!ship.flight || !IDMatch(ship.flight._id, flight._id)){
        ship.flight = flight.identifier
        ship.save()
    }
    await LogController.log({
        name: 'flight_departure', info: 'flight_departure',
        action: LogAction.FlightDeparture, flight: prev,
        owner: user.asOwner, institution: ship.asOwner
    })
}

uutil.CheckRole(UserType.Master)
CheckFlightStatus([FlightStatus.InFlight])
export async function arrival(user: UserController, flight: FlightController){
    const rel = flight.owner
    if (!rel?._id || +rel?.type != InstitutionType.Ship)
        throw 'error_no_ship'
    const prev = {...flight} as undefined as Flight
    const ship = await ShipController.get(rel._id)
    await Actions.dockFlight(flight)
    await LogController.log({
        name: 'flight_arrival', info: 'flight_arrival',
        action: LogAction.FlightArrival, flight: prev,
        owner: user.asOwner, institution: ship.asOwner
    })
}

uutil.CheckRole(UserType.Master)
CheckFlightStatus([FlightStatus.SOS])
export async function help(user: UserController, flight: FlightController){
    const rel = flight.owner
    if (!rel?._id || +rel?.type != InstitutionType.Ship)
        throw 'error_no_ship'
    const prev = {...flight} as undefined as Flight
    const ship = await ShipController.get(rel._id)
    if (!ship.flight || !IDMatch(ship.flight._id, flight._id)){
        ship.flight = flight.identifier
        ship.save()
    }
    const urel = user.relation
    const new_ship = await ShipController.get(urel?._id)
    if (+urel?.type!=InstitutionType.Ship || !new_ship)
        throw 'error_no_ship'
    if (!(await Util.checkShipAvailable(new_ship)))
        throw 'error_ship_busy'
    const new_flight = await FlightController.get({
        type: FlightType.Emergency,
        status: FlightStatus.Waiting,
        owner: new_ship.asOwner,
        location: flight.location,
        ts: +date.add(date.get(), {min: 10})
    } as Flight)
    new_flight.name = Flight.Name(new_flight)
    await new_flight.save()
    new_ship.flight = new_flight
    await new_ship.save()
    await LogController.log({
        name: 'flight_help', info: 'flight_help',
        action: LogAction.FlightHelp, flight: prev,
        owner: user.asOwner, institution: ship.asOwner,
        data: {flight: new_flight, ship: new_ship.asOwner}
    })
}


}

namespace Actions {

export async function signupFlight(flight: FlightController, user: UserController){
    const ship = await ShipController.get(flight.owner._id)
    if (!(await Util.checkShipAvailable(ship, flight)))
        throw 'error_ship_busy'
    flight.status = FlightStatus.Waiting
    flight.kind = UserTypeIn(user, UserType.Scientist) ? FlightKind.Scietific : FlightKind.Normal
    flight.owner = ship.asOwner
    flight.name = Flight.Name(flight)
    flight.departure = null
    flight.arrival = null
    await flight.save();
    ship.flight = flight.identifier
    await ship.save()
}

export async function dockFlight(flight: FlightController){
    flight.status = FlightStatus.Docked
    flight.name = null
    flight.arrival = +(new Date())
    await flight.save()
    const ship = await ShipController.get(flight.owner._id)
    if (ship.flight && IDMatch(ship.flight._id, flight._id)){
        ship.flight = null
        ship.save()
    }
    await LogController.log({
        name: 'flight_research', info: 'flight_research',
        action: LogAction.FlightDock, flight,
        owner: null, institution: ship.asOwner,
    })
}

export async function cleanFlight(flight: FlightController){
    // Delete unowned drone flights
    if (Util.isFlightType(flight.type, FlightType.Drone))
        return await flight.delete()
    if (+flight.type===FlightType.Emergency && !flight.departure)
        return await flight.delete()
    flight.status = FlightStatus.Docked
    flight.arrival = flight.departure = null
    flight.name = flight.location = null
    flight.owner = null
    await flight.save()
    const ship = await ShipController.get(flight.owner._id)
    if (ship.flight && IDMatch(ship.flight._id, flight._id)){
        ship.flight = null
        ship.save()
    }
}

export async function researchItem(item: ItemController, ship: ShipController, kind: FlightKind){
    if (item.type == ItemType.Resource){
        const res = item as unknown as Resource
        res.known = true
        if (!item.owner){
            item.owner = ship.asOwner
            if (kind===FlightKind.Scietific)
                res.value *= 1.05
        }
        await item.save()
    } else if (item.type == ItemType.Coordinates) {
        const pt = item as unknown as Coordinates
        pt.owners = (pt.owners||[]).filter(o=>!OwnerMatch(o, ship)).concat(ship.asOwner)
        await item.save()
    }
}

export async function research(flight: FlightController){
    const ship = await ShipController.get(flight.owner._id)
    const modules = await ItemController.all({'type': ItemType.Module,
        'owner._id': asID(ship._id), 'owner.type': ship.type, installed: true})
    const speed = (modules||[]).reduce((p, c)=>(p|0)+
        ((c as unknown as Module).boosts[ModStat.Research]|0), 10)
    const conf = await ConfigController.get()
    // Default value is 1 hex per 180 sec
    const ts = +new Date()
    const mov = ((conf.time?.ship?.research|0) || 360) * 10/speed
    const next_ts = mov * date.ms.SEC + flight.visit

    if (next_ts > ts)
        return
    
    const mod = Math.min(modules.reduce((p, c)=>
        Math.max(p, (c as unknown as Module).boosts[ModStat.ResearchZone]|0), 0), 2)
    const points = mutil.Coordinates.Range.offset(flight.location.pos, mod)

    const loc_id = flight.location._id
    // Mark points as known
    ship.known = ship.known||{};
    if (!ship.known[loc_id])
        ship.known[loc_id] = [] as string[]
    ship.known[loc_id] = [...new Set(ship.known[loc_id].concat(
        points.map(p=>`${p.col}:${p.row}`)))]
    await ship.save()

    const filter = points.map(p=>({'location._id': flight.location._id,
        'location.pos.col': p.col, 'location.pos.row': p.row}))
    const items = await ItemController.all({$or: filter})
    for (let item of items)
        await researchItem(item, ship, flight.kind)

    // Continue flight, even if last point
    flight.visit = ts
    flight.status = FlightStatus.InFlight
    await flight.save()

    await LogController.log({
        name: 'flight_research', info: 'flight_research',
        action: LogAction.FlightResearchDone, flight,
        owner: null, institution: ship.asOwner
    })
}

export async function move(flight: FlightController){
    const ship = await ShipController.get(flight.owner._id)
    const modules = await ItemController.all({'type': ItemType.Module,
        'owner._id': asID(ship._id), 'owner.type': ship.type, installed: true})
    const speed = (modules||[]).reduce((p, c)=>p+
        (c as unknown as Module).boosts[ModStat.Speed]|0, ship.speed)
    const conf = await ConfigController.get()
    // Default value is 1 hex per 180 sec
    const ts = +new Date()
    const mov = ((conf.time?.ship?.speed|0) || 180) * 10/speed
    const next_ts = mov * date.ms.SEC + flight.visit

    // In move
    if (next_ts>ts)
        return

    // No route
    const point = flight.points.shift()
    if (!point)
        return

    flight.visit = ts

    const pos = flight.location
    const line = mutil.Coordinates.Line.offset(point, pos.pos)
    const next_point = line.pop()
    if (next_point)
        flight.location.pos = next_point

    if (line.length)
        flight.points.unshift(point)
    else
        flight.status = FlightStatus.Research
    
    await flight.save()
    await LogController.log({
        name: 'flight_research', info: 'flight_research',
        action: LogAction.FlightMovement, flight,
        owner: null, institution: ship.asOwner,
        data: {pos, point, next_point, line}
    })
}

}


namespace Timer {


async function emitFlights(){
    const flights = await FlightController.all({$or: [
        {'type': FlightType.Drone, 'status': FlightStatus.Waiting, 'departure': null},
        {'type': FlightType.Drone, 'status': FlightStatus.Waiting, 'departure': {$exists: false}},
    ]})
    const now = +new Date()
    for (let flight of flights){
        let ship: ShipController
        try { ship = await ShipController.get(flight.owner._id) }
        catch(e){ continue }
        if (flight.ts<now){
            flight.status = FlightStatus.InFlight
            flight.name = Flight.Name(flight)
            flight.departure = now
            flight.visit = now
            await flight.save()
            // Free ship
            ship.flight = null
            ship.location = null
            await ship.save()
            await LogController.log({
                name: 'flight_departure', info: 'flight_departure',
                action: LogAction.FlightDeparture, flight,
                owner: null, institution: ship.asOwner
            })
        }
    }
}

async function checkDronesMovement(){
    const flights = await FlightController.all({'type': FlightType.Drone, 'status': FlightStatus.InFlight})
    for (let flight of flights)
        Actions.move(flight)
}

async function checkDronesResearch(){
    const flights = await FlightController.all({'type': FlightType.Drone, 'status': FlightStatus.Research})
    for (let flight of flights)
        Actions.research(flight)
}

async function checkHelpNeeded(){
    const flights = await FlightController.all({'type': FlightType.Planetary,
        'status': FlightStatus.InFlight, departure: {$lt: +date.get() - date.ms.HOUR}})
    for (let flight of flights){
        flight.status = FlightStatus.SOS
        await flight.save()
    }
}


function load(){
    utime.addIntervalEvent(60, emitFlights)
    utime.addIntervalEvent(30, checkDronesMovement)
    utime.addIntervalEvent(30, checkDronesResearch)
    utime.addIntervalEvent(180, checkHelpNeeded)
}

load()

}
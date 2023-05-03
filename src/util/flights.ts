import {
    Flight, FlightStatus, FlightType, InstitutionType,
    ItemType, LogAction, Ship, UserType, UserTypeIn
} from "../../client/src/common/entity";
import {FlightController, LogController, ShipController, UserController} from "../entity";
import * as date from '../../client/src/common/date'
import { IDMatch } from "./server";
import * as uutil from './user'
import { ApiError, Codes } from "../../client/src/common/errors";

export namespace Actions {

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
export async function signup(user: UserController, flight: FlightController, data: Flight){
    const rel = user.relation
    if (!rel?._id || +rel?.type != InstitutionType.Ship)
        throw 'error_no_ship'
    if (!FlightStatus[+data.type] || !FlightStatus[+data.status] || !+data.ts)
        throw 'Insufficient data'
    if (data.type==FlightType.Drone && !data.ts)
        throw 'Flight time unspecified'
    const ship = await ShipController.get(rel._id)
    if (+data.type==FlightType.Planetary && ship.credit<=0)
        throw 'error_no_funds'
    if (ship.flight)
        throw 'error_already_in_flight'
    flight.type = +data.type
    flight.status = FlightStatus.Waiting
    if (data.type==FlightType.Drone)
        flight.ts = +data.ts
    flight.location = data.location    
    flight.owner = ship
    flight.departure = null
    flight.arrival = null
    await flight.save();
    ship.flight = flight.identifier
    await ship.save()
    await LogController.log({
        name: 'flight_signup', info: 'flight_signup',
        action: LogAction.FlightSignup, flight, data,
        owner: user.asOwner, institution: ship.asOwner})
}

uutil.CheckRole(UserType.Captain)
CheckFlightStatus([FlightStatus.Waiting])
export async function delist(user: UserController, flight: FlightController, data: Flight){
    const rel = data.owner || user.relation
    if (!rel?._id || +rel?.type != InstitutionType.Ship)
        throw 'error_no_ship'
    if (!IDMatch(rel._id, flight.owner?._id))
        throw 'Cannot control foreign flight'
    if (+flight.status!=FlightStatus.Waiting)
        throw 'Cannot delist from started flight'
    const prev = {...flight} as undefined as Flight
    const ship = await ShipController.get(rel._id)
    // Does not store drone flights which was never executed
    if (+flight.type == FlightType.Drone)
        await flight.delete()
    else {
        flight.status = FlightStatus.Docked
        flight.arrival = flight.departure = null
        flight.location = null
        flight.owner = null
        await flight.save()
    }
    ship.flight = null
    await ship.save()
    await LogController.log({
        name: 'flight_delist', info: 'flight_delist',
        action: LogAction.FlightDelist, flight: prev, data,
        owner: user.asOwner, institution: ship.asOwner})
}

uutil.CheckRole(UserType.Guard)
CheckFlightStatus([FlightStatus.Docked, FlightStatus.Waiting])
export async function block(user: UserController, flight: FlightController, data: Flight){
    const rel = flight.owner
    if (!rel?._id || +rel?.type != InstitutionType.Ship)
        throw 'error_no_ship'
    const prev = {...flight} as undefined as Flight
    const ship = await ShipController.get(rel._id)
    flight.status = FlightStatus.Blocked
    flight.arrival = flight.departure = null
    await flight.save()
    if (!ship.flight || !IDMatch(ship.flight, flight)){
        ship.flight = flight.identifier
        ship.save()
    }
    await LogController.log({
        name: 'flight_block', info: 'flight_block',
        action: LogAction.FlightBlock, flight: prev, data,
        owner: user.asOwner, institution: ship.asOwner
    })
}

uutil.CheckRole(UserType.Guard)
CheckFlightStatus([FlightStatus.Blocked])
export async function unblock(user: UserController, flight: FlightController, data: Flight){
    const rel = flight.owner
    if (!rel?._id || +rel?.type != InstitutionType.Ship)
        throw 'error_no_ship'
    const prev = {...flight} as undefined as Flight
    const ship = await ShipController.get(rel._id)
    flight.status = FlightStatus.Waiting
    flight.arrival = flight.departure = null
    await flight.save()
    if (!ship.flight || !IDMatch(ship.flight, flight)){
        ship.flight = flight.identifier
        ship.save()
    }
    await LogController.log({
        name: 'flight_unblock', info: 'flight_unblock',
        action: LogAction.FlightUnblock, flight: prev, data,
        owner: user.asOwner, institution: ship.asOwner
    })
}

uutil.CheckRole(UserType.Master)
CheckFlightStatus([FlightStatus.Waiting])
export async function departure(user: UserController, flight: FlightController, data: Flight){
    const rel = flight.owner
    if (!rel?._id || +rel?.type != InstitutionType.Ship)
        throw 'error_no_ship'
    const prev = {...flight} as undefined as Flight
    const ship = await ShipController.get(rel._id)
    flight.status = FlightStatus.InFlight
    flight.departure = +(new Date())
    flight.arrival = null
    await flight.save()
    if (!ship.flight || !IDMatch(ship.flight, flight)){
        ship.flight = flight.identifier
        ship.save()
    }
    await LogController.log({
        name: 'flight_departure', info: 'flight_departure',
        action: LogAction.FlightDeparture, flight: prev, data,
        owner: user.asOwner, institution: ship.asOwner
    })
}

uutil.CheckRole(UserType.Master)
CheckFlightStatus([FlightStatus.InFlight])
export async function arrival(user: UserController, flight: FlightController, data: Flight){
    const rel = flight.owner
    if (!rel?._id || +rel?.type != InstitutionType.Ship)
        throw 'error_no_ship'
    const prev = {...flight} as undefined as Flight
    const ship = await ShipController.get(rel._id)
    flight.status = FlightStatus.Docked
    flight.arrival = +(new Date())
    await flight.save()
    if (ship.flight){
        ship.flight = null
        ship.save()
    }
    await LogController.log({
        name: 'flight_arrival', info: 'flight_arrival',
        action: LogAction.FlightArrival, flight: prev, data,
        owner: user.asOwner, institution: ship.asOwner
    })
}

uutil.CheckRole(UserType.Master)
CheckFlightStatus([FlightStatus.SOS])
export async function help(user: UserController, flight: FlightController, data: Flight){
    const rel = flight.owner
    if (!rel?._id || +rel?.type != InstitutionType.Ship)
        throw 'error_no_ship'
    const prev = {...flight} as undefined as Flight
    const ship = await ShipController.get(rel._id)
    if (!ship.flight || !IDMatch(ship.flight, flight)){
        ship.flight = flight.identifier
        ship.save()
    }
    const urel = user.relation
    const new_ship = await ShipController.get(urel._id)
    if (+urel.type!=InstitutionType.Ship || !new_ship)
        throw 'error_no_ship'
    if (new_ship.flight)
        throw 'error_ship_busy'
    const new_flight = await FlightController.get({
        type: FlightType.Planetary,
        status: FlightStatus.Waiting,
        owner: new_ship.asOwner,
        location: flight.location,
        ts: +date.add(date.get(), {min: 10})
    } as Flight)
    await new_flight.save()
    await LogController.log({
        name: 'flight_help', info: 'flight_help',
        action: LogAction.FlightHelp, flight: prev,
        owner: user.asOwner, institution: ship.asOwner,
        data: {data, flight: new_flight, ship: new_ship.asOwner}
    })
}

}
import {
    Flight, FlightStatus, FlightType, InstitutionType,
    ItemType, LogAction, Ship
} from "../../client/src/common/entity";
import { FlightController, LogController, ShipController, UserController, institutionController } from "../entity";
import {Time} from "./time";
import { IDMatch } from "./server";


export namespace Actions {

export async function signup(user: UserController, flight: FlightController, data: Flight){
    const rel = user.relation
    if (!rel?._id || +rel?.type != InstitutionType.Ship)
        throw 'No ship under control'
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

export async function delist(user: UserController, flight: FlightController, data: Flight){
    const rel = data.owner || user.relation
    if (!rel?._id || +rel?.type != InstitutionType.Ship)
        throw 'No ship under control'
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

export async function block(user: UserController, flight: FlightController, data: Flight){
    
    
}

export async function unblock(flight: FlightController, user: UserController){

}

export async function departure(flight: FlightController, user: UserController){

}

export async function arrival(flight: FlightController, user: UserController){

}

export async function help(flight: FlightController, user: UserController){

}

}
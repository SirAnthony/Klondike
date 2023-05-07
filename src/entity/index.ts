import {Corporation, Flight, InstitutionType, Item, Order, Planet} from '../../client/src/common/entity'
import {Ship, PlanetShip, Loan, ExpenseType, Owner, Pos, Location} from '../../client/src/common/entity'
import {Controller as UserController} from './users'
import {Controller as LogController} from './logs'
import {Controller as ConfigController} from './config'
import {MakeController} from './base'
import {Time} from '../util/time';
import {asID} from '../util/server'

export class ItemController extends MakeController(Item, 'items') {}
export class CorpController extends MakeController(Corporation, 'corps') {}
export class OrderController extends MakeController(Order, 'orders') {}
export class FlightController extends MakeController(Flight, 'flights') {}

export class ShipController extends MakeController(Ship, 'ships'){
    static PlanetShip(ship: Ship): PlanetShip {
        return {_id: asID(ship._id), name: ship.name, type: ship.type,
            kind: ship.kind, img: ship.img, location: ship.location,
            known: ship.known}
    }
}

export class PlanetController extends MakeController(Planet, 'planets'){
    static location(p: PlanetController, pos: Pos): Location {
        return {_id: asID(p._id), name: p.name, pos, system: p.system} }
}

export class LoanController extends MakeController(Loan, 'loans') {
    static create(lender: Owner, creditor: Owner, amount: number = 0) {
        return new LoanController({creditor, lender, amount, ts: Time.time,
            type: ExpenseType.Loan})
    }
    static createFine(creditor: Owner, owner: Owner, amount = 0, data: string){
        return new LoanController({creditor, amount, ts: Time.time,
            owner, data, type: ExpenseType.Fine})
    }
}

export {UserController, LogController, ConfigController}

export type InstitutionController = UserController | CorpController | ShipController
export function institutionController(type: InstitutionType){
    switch(+type){
        case InstitutionType.User: return UserController
        case InstitutionType.Research: return CorpController
        case InstitutionType.Corporation: return CorpController
        case InstitutionType.Organization: return CorpController
        case InstitutionType.Ship: return ShipController
    }
}
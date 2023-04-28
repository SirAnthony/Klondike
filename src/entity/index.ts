import {Corporation, Flight, InstitutionType, Item, Order} from '../../client/src/common/entity'
import {Loan, ExpenseType, Owner} from '../../client/src/common/entity'
import {Controller as UserController} from './users'
import {Controller as ShipController} from './ships'
import {Controller as PlanetController} from './planets'
import {Controller as LogController} from './logs'
import {Controller as ConfigController} from './config'
import {MakeController} from './base'
import {Time} from '../util/time';

export class ItemController extends MakeController(Item, 'items') {}
export class CorpController extends MakeController(Corporation, 'corps') {}
export class OrderController extends MakeController(Order, 'orders') {}
export class FlightController extends MakeController(Flight, 'flights') {}

export class LoanController extends MakeController(Loan, 'loans') {
    static create(lender: Owner, creditor: Owner, amount: number = 0) {
        return new LoanController({creditor, lender, amount, ts: Time.time,
            type: ExpenseType.Loan})
    }
    static createFine(creditor: Owner, amount = 0){
        return new LoanController({creditor, amount, ts: Time.time,
            type: ExpenseType.Fine})
    }
}

export {UserController, ShipController, PlanetController,
    LogController, ConfigController}

export function institutionController(type: InstitutionType){
    switch(type){
        case InstitutionType.User: return UserController
        case InstitutionType.Research: return CorpController
        case InstitutionType.Corporation: return CorpController
        case InstitutionType.Organization: return CorpController
        case InstitutionType.Ship: return ShipController
    }
}
import {InstitutionType} from '../../client/src/common/entity'
import {Controller as UserController} from './users'
import {Controller as ShipController} from './ships'
import {Controller as CorpController} from './corps'
import {Controller as PlanetController} from './planets'
import {Controller as FlightController} from './flights'
import {Controller as OrderController} from './orders'
import {Controller as ItemController} from './items'
import {Controller as LoanController} from './loans'
import {Controller as LogController} from './logs'
import {Controller as ConfigController} from './config'

export {UserController, ShipController, CorpController, PlanetController,
    FlightController, OrderController, ItemController, LoanController,
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
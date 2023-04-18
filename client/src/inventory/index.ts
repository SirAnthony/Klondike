import EventEmitter from '../common/events'

export {BudgetDetails, BalanceDetails} from './Balance'
export {TimeDetails} from './Time'
export {PriceDetails} from './Prices'
export {Confirmator} from './Confirmation'
export {ItemRow, ItemRowDesc} from './Item'
export {PatentLabItem, PatentRow, PatentRowDesc} from './Patent'
export {OrderRowCompact} from './Order'

export const InventoryEvents = new EventEmitter()
export enum InventoryEventType {reloadTime, reloadBalance, timeChanged,
    reloadPatents, reloadItems, reloadOrders, reloadPrices, reloadLoans,
    reloadRating}
Object.keys(InventoryEventType).filter(t=>isNaN(+t)).forEach(c=>{
    InventoryEvents[c] = ()=>InventoryEvents.emit(c)
    InventoryEvents[`on${c}`] = (...args)=>InventoryEvents.on(c, ...args)
})

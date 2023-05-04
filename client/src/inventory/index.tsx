import React from 'react'
import * as RR from 'react-router-dom'
import InventoryDetails from './Inventory'
import {User} from '../common/entity'
import EventEmitter from '../common/events'

export {BudgetDetails, BalanceDetails} from './Balance'
export {TimeDetails} from './Time'
export {PriceDetails} from './Prices'
export {Confirmator} from './Confirmation'
export {ItemRow, ItemRowDesc} from './Item'
export {PatentLabItem, PatentRow, PatentRowDesc} from './Patent'
export {OrderRowCompact} from './Order'
export {ProposalRow} from './Proposal'

export const InventoryEvents = new EventEmitter()
export enum InventoryEventType {reloadTime, reloadBalance, timeChanged,
    reloadPatents, reloadItems, reloadOrders, reloadPrices, reloadLoans,
    reloadProposals, reloadRating, reloadModules, reloadConfig}
Object.keys(InventoryEventType).filter(t=>isNaN(+t)).forEach(c=>{
    InventoryEvents[c] = ()=>InventoryEvents.emit(c)
    InventoryEvents[`on${c}`] = (...args)=>InventoryEvents.on(c, ...args)
});

function InventoryDetailsNavigator(props: {user: User}){
    const params = RR.useParams()
    const {id, type} = params
    return <InventoryDetails user={props.user} id={id} type={+type} />
}

export function Navigator(props){
    const {user} = props
    return (<div>
      <RR.Routes>
        <RR.Route path='/' element={<InventoryDetailsNavigator user={user} />} />
        <RR.Route path='/:type/:id' element={<InventoryDetailsNavigator user={user} />} />
        <RR.Route path='/all' />
      </RR.Routes>
    </div>)
}
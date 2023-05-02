import React from 'react'
import * as RB from 'react-bootstrap'
import {Item, Resource, User} from '../common/entity'
import {Owner} from '../common/entity'
import {default as L} from './locale'
import { ItemKindCol } from './Item/components'
import {ItemConfirmation} from './Confirmation'
import { InventoryEvents } from '.'

type RowDescProps = {
    className?: string
}
type RowProps = {
    user: User
    item?: Item
    owner: Owner
    onRefuse: (item: Item)=>Promise<boolean>
} & RowDescProps

export function ProposalRow(props: RowProps){
    const {item, user, onRefuse} = props
    const [confirm, showConfirm] = React.useState(false)
    const confirmClose = ()=>{
        showConfirm(false)
        InventoryEvents.reloadProposals()
        InventoryEvents.reloadItems()
        InventoryEvents.reloadBalance()
    }
    return <RB.Row className='menu-list-row'>
      <RB.Col>{item.market.from.name}</RB.Col>
      <ItemKindCol item={item} layout={null} />
      <RB.Col>{(item as Resource).value||1}</RB.Col>
      <RB.Col sm={3}>{L(`market_propose_for_${item.market.type}`)}</RB.Col>
      <RB.Col>{item.market.price}</RB.Col>
      <RB.Col sm={3}>
        {confirm && <ItemConfirmation action='buy' onClose={confirmClose}
            id={item._id} user={user} code={item.market.code} />}
        <RB.Button onClick={()=>showConfirm(true)}>{L('act_agree')}</RB.Button>
        <RB.Button onClick={()=>onRefuse(item)}>{L('act_disagree')}</RB.Button>
      </RB.Col>
    </RB.Row>
}
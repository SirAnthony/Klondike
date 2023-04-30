import React from 'react'
import * as RB from 'react-bootstrap'
import {Institution, Item, User} from '../../common/entity'
import {Resource, Patent, Loan} from '../../common/entity'
import {LocationCol, ResourceCostCol, ItemPriceCol} from './components'
import {ItemOwnerCol, ItemPriceInputProps, ItemKindCol} from './components'
import {ItemActions} from './Actions'
import {ItemPopoverOverlay} from './Popover'
import {IDField} from '../../util/components'
import {LR} from '../locale'
import * as iutil from './util'
import { ItemRowNew } from './RowNew'

type ItemRowTitleProps = {
    className?: string
    long?: boolean
}

export type ItemRowProps = {
    user: User
    item: Item
    entity?: Institution
    layout?: number
    onSubmit?: (item: Item)=>Promise<boolean>
    onDelete?: (item: Item)=>Promise<boolean>
    onPatentPay?: (item: Item, patent: Patent)=>Promise<boolean>
    onOrderPay?: (item: Item)=>Promise<boolean>
    onLoanPay?: (item: Item, loan: Loan)=>Promise<boolean>
    onDelist?: (item: Item)=>Promise<boolean>
} & ItemPriceInputProps & ItemRowTitleProps

export function ItemRowDesc(props: ItemRowTitleProps){
    const {long} = props
    const lyt = iutil.column_layout(long)
    return <RB.Row className={props.className}>
      <RB.Col sm={lyt.id}>{LR('item_desc_id')}</RB.Col>
      <RB.Col sm={lyt.name}>{LR('item_desc_name')}</RB.Col>
      <RB.Col sm={lyt.type}>{LR('item_desc_type')}</RB.Col>
      <RB.Col sm={lyt.kind}>{LR('res_desc_kind')}</RB.Col>
      {long && <RB.Col sm={lyt.owner}>{LR('item_desc_owner')}</RB.Col>}
      {long && <RB.Col sm={lyt.location}>{LR('item_desc_location')}</RB.Col>}
      <RB.Col sm={lyt.value}>{LR('res_desc_value')}</RB.Col>
      <RB.Col sm={lyt.price}>{LR('item_desc_price')}</RB.Col>
      {long && <RB.Col sm={lyt.data}>{LR('item_desc_data')}</RB.Col>}
      <RB.Col sm={lyt.actions}>{LR('item_desc_actions')}</RB.Col>
    </RB.Row>
}

export function ItemRow(props: ItemRowProps){
    const {item, long} = props
    const ref = React.useRef(null)
    if (long)
        return <ItemRowContent {...props} />
    return <RB.Row><RB.Col>
      <ItemPopoverOverlay item={item} show={true} target={ref.current}>
        <ItemRowContent {...props} />
      </ItemPopoverOverlay>
    </RB.Col></RB.Row>
}

function ItemRowContent(props: ItemRowProps){
    const [edit, showEdit] = React.useState(false)
    const {user, item, long} = props
    const obj = new (Item.class(item.type))(item)
    const res = item as Resource, pt = item as Patent
    const has = n=>obj.keys.includes(n)
    const lyt = iutil.column_layout(long)
    if (user.admin && long && edit){
        return <ItemRowNew {...props} onSubmit={async (item)=>{
            if (await props.onSubmit(item))
                showEdit(false)
        }} onCancel={()=>showEdit(false)} />
    }
    const onEdit = long && user.admin ? ()=>showEdit(true) : null
    return <RB.Row className={props.className}>
      <RB.Col sm={lyt.id}><IDField item={item} /></RB.Col>
      <RB.Col sm={lyt.name}>{item.name}</RB.Col>
      <RB.Col sm={lyt.type}>{LR(`item_type_${item.type}`)}</RB.Col>
      <ItemKindCol {...props} layout={lyt.kind} />
      {long && <ItemOwnerCol {...props} layout={lyt.owner} />}
      {long && <LocationCol {...props} layout={lyt.location} />}
      {has('resourceCost') && <ResourceCostCol {...props} layout={lyt.value} />}
      {!has('resourceCost') && <RB.Col sm={lyt.value}>
        {'value' in res ? res.value|0 : 1}
      </RB.Col>}
      <ItemPriceCol item={item} layout={lyt.price} />
      {long && <RB.Col sm={lyt.data}>{res.data}</RB.Col>}
      <ItemActions {...props} layout={lyt.actions} onEdit={onEdit} />
    </RB.Row>
}
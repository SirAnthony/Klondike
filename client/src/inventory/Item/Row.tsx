import React from 'react'
import * as RB from 'react-bootstrap'
import {Corporation, Item, ItemType, User} from '../../common/entity'
import {Resource, Patent, Owner, PatentOwner} from '../../common/entity'
import {LocationCol, ResourceCostCol, ItemPriceCol} from './components'
import {ItemOwnerCol, ItemPriceInputProps} from './components'
import {ItemActions} from './Actions'
import {ItemPopoverOverlay} from './Popover'
import {IDField} from '../../util/components'
import {default as L, LR} from '../locale'
import * as iutil from './util'

type ItemRowTitleProps = {
    className?: string
    long?: boolean
}

export type ItemRowProps = {
    user: User
    item: Item
    corp?: Corporation 
    layout?: number
    onDelete?: (item: Item)=>void
    onPatentPay?: (item: Item, patent: Patent)=>void
    onOrderPay?: (item: Item)=>void
    onLoanPay?: (item: Item)=>void
    onDelist?: (item: Item)=>void
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
        <ItemRowContent ref={ref} {...props} />
      </ItemPopoverOverlay>
    </RB.Col></RB.Row>
}

class ItemRowContent extends React.Component<ItemRowProps, {}> {
    kind(item: Item){
        const res = item as Resource, pt = item as Patent
        return res.kind==undefined ? '-' :
            item.type==ItemType.Patent ?
            LR(`patent_kind_${pt.kind}`)+'/'+LR(`patent_weigth_${pt.weight}`) :
            LR(`res_kind_${res.kind}`)
    }
    render(){
        const {item, long} = this.props
        const obj = new (Item.class(item.type))(item)
        const res = item as Resource, pt = item as Patent
        const has = n=>obj.keys.includes(n)
        const lyt = iutil.column_layout(long)
        return <RB.Row className={this.props.className}>
          <RB.Col sm={lyt.id}><IDField item={item} /></RB.Col>
          <RB.Col sm={lyt.name}>{item.name}</RB.Col>
          <RB.Col sm={lyt.type}>{LR(`item_type_${item.type}`)}</RB.Col>
          <RB.Col sm={lyt.kind}>{this.kind(item)}</RB.Col>
          {long && <ItemOwnerCol {...this.props} layout={lyt.owner} />}
          {long && <LocationCol {...this.props} layout={lyt.location} />}
          {has('resourceCost') && <ResourceCostCol {...this.props} layout={lyt.value} />}
          {!has('resourceCost') && <RB.Col sm={lyt.value}>
            {'value' in res ? res.value|0 : 1}
          </RB.Col>}
          <ItemPriceCol item={item} layout={lyt.price} />
          {long && <RB.Col sm={lyt.data}>{res.data}</RB.Col>}
          <ItemActions {...this.props} layout={lyt.actions} />
        </RB.Row>
    }
}
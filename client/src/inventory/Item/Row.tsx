import React from 'react'
import * as RB from 'react-bootstrap'
import {Corporation, Item, ItemType, User} from '../../common/entity'
import {Resource, Patent} from '../../common/entity'
import {LocationCol, ResourceCostCol, ItemPriceCol} from './components'
import {ItemPriceInputProps} from './components'
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
    onPay?: (item: Item, patent: Patent)=>void
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
    if (long)
        return <ItemRowContent {...props} />
    const ref = React.useRef(null)
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
    owner(item: Item){
        const pt = item as Patent
        return item.type==ItemType.Patent ? pt.owners.map(o=>
            <div key={'d_'+o._id}>{`${o.name} (${LR('patent_status_'+o.status)})`}</div>) :
            item.owner?.name||'-'
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
          {long && <RB.Col sm={lyt.owner}>{this.owner(item)}</RB.Col>}
          {long && <LocationCol {...this.props} layout={lyt.location} />}
          {has('resourceCost') && <ResourceCostCol {...this.props} layout={lyt.value} />}
          {has('value') && <RB.Col sm={lyt.value}>{res.value|0}</RB.Col>}
          <ItemPriceCol item={item} layout={lyt.price} />
          {long && <RB.Col sm={lyt.data}>{res.data}</RB.Col>}
          <ItemActions {...this.props} layout={lyt.actions} />
        </RB.Row>
    }
}
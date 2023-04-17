import React from 'react'
import * as RB from 'react-bootstrap'
import {Corporation, Item, ItemType, User} from '../../common/entity'
import {Resource, Patent, Location} from '../../common/entity'
import {LocationCol, ResourceCostCol, ItemPriceCol} from './components'
import {ItemPriceInputProps} from './components'
import {ItemActions} from './Actions'
import {IDField} from '../../util/components'
import {default as L, LR} from '../locale'
import * as iutil from './util'

type ItemPopoverProps = {
    item: Item
}

type ItemRowKeyProps = {
    field: string
} & ItemPopoverProps

function ItemKeyLocation(props: {loc: Location}){
    const {loc} = props

    return <RB.Container>
      <RB.Row>
        <RB.Col>{L('location_desc_coord')}</RB.Col>
        <RB.Col>{loc.pos.col*173 + ', '+loc.pos.row*173}</RB.Col>
      </RB.Row>
      <RB.Row>
        <RB.Col>{L('location_desc_planet')}</RB.Col>
        <RB.Col>{loc.name}</RB.Col>
      </RB.Row>
      <RB.Row>
        <RB.Col>{L('location_desc_system')}</RB.Col>
        <RB.Col>{loc.system}</RB.Col>
      </RB.Row>
      <RB.Row>
        <RB.Col>{L('location_desc_sector')}</RB.Col>
        <RB.Col>{LR('sector_name')}</RB.Col>
      </RB.Row>
    </RB.Container>
}

class ItemKeyRow extends React.Component<ItemRowKeyProps, {}> {
  get col_size(){ return null }
  col(element: React.ReactElement | string, size?: number){
      return <RB.Col sm={size||this.col_size}>{element}</RB.Col>
  }
  get prefix(){
      const {item} = this.props
      return item.type == ItemType.Resource ? 'res' :
          item.type == ItemType.Patent ? 'patent' :
          item.type == ItemType.Artifact ? 'artifact' : 'item'
  }
  field__id(){
      return this.col(<IDField item={this.props.item} />) }
  field_type(){
      return this.col(LR(`item_type_${this.props.item.type}`)) }
  field_kind(){
      const {item} = this.props
      return this.col(LR(`${this.prefix}_kind_${(item as any).kind}`))
  }
  field_price(){
      return <ItemPriceCol item={this.props.item} layout={this.col_size} /> }
  field_owner(){
      return this.col(this.props.item.owner?.name||'-') }
  field_location(){
      return this.col(<ItemKeyLocation loc={this.props.item.location} />, 12) }
  field_target(){
      return this.col(<ItemKeyLocation loc={(this.props.item as any).target} />, 12) } 
  field_generic(){
      return this.col(this.props.item[this.props.field]) }
  render(){
      const {item, field} = this.props
      if (['market'].includes(field))
          return null
      const desc = (this[`field_${field}`]||this.field_generic).call(this)
      const prefix = !['kind', 'value', 'weight', 'ownership'].includes(field) ?
          'item' : this.prefix
      return <RB.Row>
        <RB.Col>{LR(`${prefix}_desc_${field}`)}</RB.Col>
        {desc}
      </RB.Row>
  }
}

export function ItemPopover(props: ItemPopoverProps){
    const {item} = props
    const obj = new (Item.class(item.type))(item)
    const rows = obj.keys.map(k=>
        <ItemKeyRow item={item} field={k} key={`item_popover_${item._id}_${k}`} />)
    return <RB.Popover>
      <RB.PopoverBody>
        {rows}
      </RB.PopoverBody>
    </RB.Popover>
}

type ItemPopoverOverlayProps = {
    show: boolean
    children: React.ReactElement
    target: any
} & ItemPopoverProps

export function ItemPopoverOverlay(props: ItemPopoverOverlayProps){
    const {item, children} = props
    const obj = new (Item.class(item.type))(item)
    const rows = obj.keys.map(k=>
        <ItemKeyRow item={item} field={k} key={`item_popover_${item._id}_${k}`} />)
    const popover = <RB.Popover>
      <RB.PopoverBody>{rows}</RB.PopoverBody>
    </RB.Popover>
    return <RB.OverlayTrigger placement='top' trigger={['hover']} rootClose={true}
      overlay={popover}>
      <RB.Container>{children}</RB.Container>
    </RB.OverlayTrigger>
}
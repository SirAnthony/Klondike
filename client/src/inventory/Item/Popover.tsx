import React from 'react'
import * as RB from 'react-bootstrap'
import {Item, ItemType} from '../../common/entity'
import {Location} from '../../common/entity'
import {ItemOwnerCol, ItemPriceCol, ItemModuleBoostsCol, ResourceCostCol} from './components'
import {IDField} from '../../util/components'
import {default as L, LR} from '../locale'

type ItemPopoverProps = {
    item: Item
    onClose?: ()=>void
}

type ItemRowKeyProps = {
    field: string
} & ItemPopoverProps

function ItemKeyLocation(props: {loc: Location}){
    const {loc} = props
    if (!loc)
      return <span>-</span>
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
        return <ItemOwnerCol item={this.props.item} layout={this.col_size} /> }
    field_owners(){
        return <ItemOwnerCol item={this.props.item} layout={this.col_size} /> }
    field_location(){
        const size = this.props.item?.location ? 12 : this.col_size
        return this.col(<ItemKeyLocation loc={this.props.item.location} />, size)
    }
    field_installed(){
        return this.col(LR((this.props.item as any).installed ? 'desc_yes' : 'desc_no' )) }
    field_boosts(){
        return <ItemModuleBoostsCol item={this.props.item} layout={this.col_size} /> }
    field_target(){
        const size = this.props.item?.location ? 12 : this.col_size
        return this.col(<ItemKeyLocation loc={(this.props.item as any).target} />, size)
    }
    field_resourceCost(){
        return <ResourceCostCol item={this.props.item} layout={this.col_size} /> }
    field_served(){
        return <ItemOwnerCol item={this.props.item} layout={this.col_size} /> }
    field_generic(){
        return this.col(this.props.item[this.props.field]) }
    render(){
        const {item, field} = this.props
        // Do not show multiowners
        if (['market', 'owners'].includes(field))
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
    const {item, onClose} = props
    if (!item)
        return null
    const obj = new (Item.class(item.type))()
    for (let k in item)
        obj[k] = item[k]
    const rows = obj.keys.map(k=>
        <ItemKeyRow item={item} field={k} key={`item_popover_${item._id}_${k}`} />)
    return <RB.Popover>
      {onClose && <RB.PopoverHeader>
        <RB.CloseButton onClick={onClose} />
      </RB.PopoverHeader>}
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
    if (!item)
        return children
    const obj = new (Item.class(item.type))()
    for (let k in item)
        obj[k] = item[k]
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
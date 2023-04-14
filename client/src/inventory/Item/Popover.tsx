import React from 'react'
import * as RB from 'react-bootstrap'
import {Corporation, Item, ItemType, User} from '../../common/entity'
import {Resource, Patent} from '../../common/entity'
import {LocationCol, ResourceCostCol, ItemPriceCol} from './components'
import {ItemPriceInputProps} from './components'
import {ItemActions} from './Actions'
import {IDField} from '../../util/components'
import {default as L, LR} from '../locale'
import * as iutil from './util'

type ItemPopoverProps = {
    item: Item
}

function ItemKeyRow(props: {item: Item, field: string}){
    const {item, field} = props
    return <RB.Row>
      <RB.Col>{LR(`item_desc_${field}`)}</RB.Col>
      <RB.Col>{JSON.stringify(item[field])}</RB.Col>
    </RB.Row>
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
} & ItemPopoverProps

export function ItemPopoverOverlay(props: ItemPopoverOverlayProps){
    const {item, show} = props
    const target = React.useRef(null)
    return <RB.Overlay target={target.current} placement='top' show={show} rootClose={true} >
      {()=><ItemPopover item={item} />}
    </RB.Overlay>
}
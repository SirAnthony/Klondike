import React from 'react'
import * as RB from 'react-bootstrap'
import {Item, Owner, Patent} from '../../common/entity'
import {OwnerValueSelectTrigger} from '../../util/popovers'
import {PriceFetcher} from '../Prices'
import {default as L, LR} from '../locale'
import * as iutil from './util'
import defines from '../../common/defines'

type ItemComponentProps = {
    item: Item
    layout: number
}

export function LocationCol(props: ItemComponentProps) {
    const {location} = props.item
    if (!location)
        return <RB.Col sm={props.layout}>-</RB.Col>
    return <RB.Col sm={props.layout}>
      <span>{location.system}</span>
      <span>{location.name}</span>
      <span>{location.pos.col}:{location.pos.row}</span>
    </RB.Col>
}

export function ResourceCostCol(props: ItemComponentProps){
    const {item, layout} = props
    const {resourceCost} = item as Patent
    if (!resourceCost || !resourceCost.length)
        return <RB.Col sm={props.layout}>-</RB.Col>
    const res = resourceCost.map(v=>
      <div key={`res_cost_${item._id}_${v.kind}`}>
        {LR(`res_kind_${v.kind}`)+` [${v.provided|0}/${v.value}]`}
      </div>)
    return <RB.Col sm={layout}>
      {res}
    </RB.Col>
}

export class ItemPriceCol extends PriceFetcher<ItemComponentProps, {}> {
    render(){
        return <RB.Col sm={this.props.layout}>
          {iutil.item_base_price(this.props.item, this.state.prices)}
        </RB.Col>
    }
}

export type ItemPriceInputProps = {
    item: Item
    onSell?: (item: Item, target: Owner, price: number)=>void
}

export class ItemPriceInput extends PriceFetcher<ItemPriceInputProps, {}> {
    render(){
        const {item, onSell} = this.props
        const base_price = iutil.item_base_price(item, this.state.prices)
        const inputRange: [number, number] = [
            base_price*defines.price.low_modifier,
            base_price*defines.price.high_modifier
        ]
        return <OwnerValueSelectTrigger onClick={(owner, price)=>onSell(item, owner, price)}
          inputRange={inputRange} desc={L('act_sell')} valDesc={LR('item_desc_price')}
          exclude={iutil.owners_exclude(item.type)}/>
    }
}
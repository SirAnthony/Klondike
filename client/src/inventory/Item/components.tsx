import React from 'react'
import * as RB from 'react-bootstrap'
import {Item, ItemType, Owner, Resource} from '../../common/entity'
import {Patent, Loan} from '../../common/entity'
import {LoanSelectTrigger, OwnerValueSelectTrigger} from '../../util/popovers'
import {ResourceImg} from '../../util/components'
import {PriceFetcher} from '../Prices'
import {default as L, LR} from '../locale'
import * as iutil from './util'
import defines from '../../common/defines'
import * as _ from 'lodash'

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
      <span>{location.pos?.col}:{location.pos?.row}</span>
    </RB.Col>
}

export function ItemKindCol(props: {item: Item, layout: number}){
    const {item, layout} = props
    const res = item as Resource, pt = item as Patent
    const el = ![ItemType.Patent, ItemType.Resource].includes(res.type) ? '-' :
        item.type==ItemType.Patent ?
        LR(`patent_kind_${pt.kind}`)+'/'+LR(`patent_weigth_${pt.weight}`) :
        [<ResourceImg res={res} />, LR(`res_kind_${res.kind}`)]
    return <RB.Col sm={layout}>
      {el}
    </RB.Col>
}

export function ItemOwnerCol(props: ItemComponentProps){
    const {item} = props
    const owners = _.uniqBy([].concat(item.owner, (item as any).owners).filter(Boolean), p=>p._id)
    const items = owners.map(o=><div key={'d_'+o._id}>{o?.name||'-'}</div>)
    if (!items.length)
        items.push(<div key='d_missing_owner'>-</div>)
    return <RB.Col sm={props.layout}>
      {items}
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

export type ItemLoanInputProps = {
    item: Item
    onPay?: (item: Item, loan: Loan)=>Promise<boolean>
}

export class ItemLoanInput extends PriceFetcher<ItemLoanInputProps, {}> {
    render(){
        const {item, onPay} = this.props
        const base_price = iutil.item_base_price(item, this.state.prices)
        const inputRange: [number, number] = [
            base_price*defines.price.low_modifier,
            base_price*defines.price.high_modifier
        ]
        return <LoanSelectTrigger onClick={loan=>onPay(item, loan)}
          inputRange={inputRange} desc={L('act_loan_pay')} source={item.owner} />
    }
}

export type ItemPriceInputProps = {
    item: Item
    nullable?: boolean
    noRange?: boolean
    source?: Owner
    onSell?: (item: Item, target: Owner, price: number)=>Promise<boolean>
}

export class ItemPriceInput extends PriceFetcher<ItemPriceInputProps, {}> {
    render(){
        const {item, noRange, nullable, onSell} = this.props
        const base_price = iutil.item_base_price(item, this.state.prices)
        const inputRange: [number, number] | null = nullable ? null : [
            noRange ? 1 : base_price*defines.price.low_modifier,
            noRange ? Number.MAX_SAFE_INTEGER : base_price*defines.price.high_modifier
        ]
        return <OwnerValueSelectTrigger onClick={(owner, price)=>onSell(item, owner, price)}
          inputRange={inputRange} desc={L('act_sell')} valDesc={LR('item_desc_price')}
          exclude={iutil.owners_exclude(item.type)} source={this.props.source}
          nullable={nullable} />
    }
}
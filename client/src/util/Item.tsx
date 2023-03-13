import React from 'react'
import * as RB from 'react-bootstrap'
import {Item as EItem, MarketType, Resource as EResource} from '../common/entity'
import L from '../common/locale'

type ItemRowProps = {
    className?: string
    admin?: boolean
    owner?: boolean
}

type ItemProps = {
    item: EItem
} & ItemRowProps

export function ItemRowDesc(props: ItemRowProps){
    const {admin} = props
    return <RB.Row className={props.className}>
      <RB.Col>{L('res_desc_id')}</RB.Col>
      <RB.Col>{L('res_desc_type')}</RB.Col>
      <RB.Col>{L('res_desc_name')}</RB.Col>
      <RB.Col>{L('res_desc_volume')}</RB.Col>
      <RB.Col>{L('res_desc_price')}</RB.Col>
      {admin && <RB.Col>{L('res_market_type')}</RB.Col>}
      <RB.Col>{L('res_desc_actions')}</RB.Col>
    </RB.Row>
}

type ItemState = {

}
class ItemActions extends React.Component<ItemProps, ItemState> {
    constructor(props){
        super(props);
        ['buy', 'sell', 'assign', 'lock'].forEach(cmd=>
            this[`do_${cmd}`] = this[`do_${cmd}`].bind(this))
    }
    async do_buy(){

    }
    async do_sell(){

    }
    async do_assign(){

    }
    async do_lock(){
        
    }
    btn_buy(){
        const {owner, item} = this.props
        if (owner)
            return null
        return <RB.Button onClick={this.do_buy}>{L('act_buy')}</RB.Button>
    }
    btn_sell(){
        const {owner, item} = this.props
        if (!owner)
            return null
        return <RB.Button onClick={this.do_sell}>{L('act_sell')}</RB.Button>
    }
    btn_assign(){
        const {admin} = this.props
        if (!admin)
            return null
        return <RB.Button onClick={this.do_assign}>{L('act_assign')}</RB.Button>
    }
    btn_lock(){
        const {admin, item} = this.props
        if (!admin)
            return null
        return <RB.Button onClick={this.do_lock}>{L(`act_lock`)}</RB.Button>
    }
    item_type(){
        const {item} = this.props
        const {type} = {type: 'buy'} // item.market
        return <span>{L(`act_item_market_${type}`)}</span>
    }
    render() {
        if (!this.props.item)
            return null
        return <RB.Col>
          {this.item_type()}
          {this.btn_buy()}
          {this.btn_sell()}
          {this.btn_assign()}
        </RB.Col>
    }
}

export function ItemRow(props: ItemProps & {item: EItem}){
    const {item, admin, owner} = props
    const res = item as EResource
    const type = 'buy' // item.market.type
    return <RB.Row className={props.className}>
      <RB.Col>{item._id}</RB.Col>
      <RB.Col>{L(`res_type_${item.type}`)}</RB.Col>
      <RB.Col>{res.kind ? L(`res_kind_${res.kind}`) : '-'}</RB.Col>
      <RB.Col>{res.value || 1}</RB.Col>
      <RB.Col>{item.price}</RB.Col>
      {admin && <RB.Col>{L(`res_market_type_${type}`)}</RB.Col>}
      <ItemActions {...props} />
    </RB.Row>
}
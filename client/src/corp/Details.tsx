import React from 'react'
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import {Corporation as ECorp, Order, User} from '../common/entity'
import {Item as EItem} from '../common/entity'
import {ItemRow, ItemRowDesc} from '../util/Item'
import {OrderRowCompact} from '../util/Order'
import {default as L, LR} from './locale'

type OrderDetailsState = {
    orders?: Order[]
}
type OrderDetailsProps = {
    cycle?: number
    corp: ECorp
    user: User
    full?: Boolean
    fields?: string[]
}
export class OrderDetails extends F.Fetcher<OrderDetailsProps, OrderDetailsState> {
    constructor(props){
        super(props)
        this.state = {}
    }
    get fetchUrl() { 
        const {corp} = this.props
        return `/api/corp/orders/${corp._id}`
    }
    fetchState(data: any = {}){
        const {orders} = data
        return {item: data, orders}
    }
    has(field: string){ return this.props.fields?.includes(field) }
    planInfo(){
        if (!this.has('plan'))
            return null
        const {cycle} = this.props, {orders} = this.state
        const plan = (orders?.filter(o=>o.cycle==cycle).reduce(
            (p, c)=>p+c.plan, 1)||1)/(orders?.length||1)
        return <RB.Row>
          <RB.Col>{L('order', cycle)}</RB.Col>
          <RB.Col>{L('plan', plan*100)}</RB.Col>
        </RB.Row>
    }
   render(){
        const orders = this.state.orders?.map(order=><OrderRowCompact
            key={`order_row_compact_${order._id}`} order={order} />)
        return <RB.Container>
          {this.planInfo()}
          {orders}
        </RB.Container>
    }
}

type ItemDetailsState = {
    items?: EItem[]
}
type ItemDetailsProps = {
    corp: ECorp
    user: User
}
export class ItemDetails extends F.Fetcher<ItemDetailsProps, ItemDetailsState> {
    constructor(props){
        super(props)
        this.state = {}
    }
    get fetchUrl() { 
        const {corp} = this.props
        return `/api/corp/items/${corp._id}`
    }
    fetchState(data: any = {}){
        const {items} = data
        return {item: data, items}
    }
    rows(fields?: string[]){
        const {items = []} = this.state
        const rows = items.map(i=><ItemRow onReload={()=>this.fetch()}
            key={`item_row_${i._id}`} item={i} {...this.props} fields={fields}/>)
        return rows
    }
    render(){
        const fields = ['kind', 'location', 'data']
        return <RB.Container>
          <RB.Row className='menu-list-title'>
            <RB.Col>{L('res_cur')}</RB.Col>
          </RB.Row>
          <ItemRowDesc {...this.props} fields={fields} />
          {this.rows(fields)}
        </RB.Container>
    }
}

type PriceDetailsState = {
    prices?: {ResourceType: number}
}
type PriceDetailsProps = {
    user: User
}
export class PriceDetails extends F.Fetcher<PriceDetailsProps, PriceDetailsState> {
    constructor(props){
        super(props)
        this.state = {}
    }
    get fetchUrl() { return '/api/corp/prices' }
    fetchState(data: any = {}){
        const {prices} = data
        return {item: data, prices}
    }
    render(){
        const {prices = {}} = this.state
        const items = Object.keys(prices).map(k=><RB.Row key={`market_res_${k}`}>
          <RB.Col>{LR(`res_kind_${k}`)}</RB.Col>
          <RB.Col>{prices[k]}</RB.Col>
        </RB.Row>)
        return <RB.Container>
          <RB.Row className='menu-list-title'>
            <RB.Col>{L('market_prices')}</RB.Col>
          </RB.Row>
          {items}
        </RB.Container>
    }
}
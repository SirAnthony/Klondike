import React from 'react'
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import {Corporation, InstitutionType, Order, User} from '../common/entity'
import {Item, Patent, MarketType, Owner} from '../common/entity'
import {ItemRow, ItemRowDesc} from '../inventory/Item'
import {PatentLabItem, PatentRow, PatentRowDesc} from '../inventory/Patent'
import {OrderRowCompact} from '../inventory/Order'
import EventEmitter from '../common/events'
import * as util from '../common/util'
import {default as L} from './locale'
import {Delimeter} from '../util/components'

const DetailsEvents = new EventEmitter()
export enum EventType {reloadPatents, reloadItems, reloadOrders, reloadPrices}
export const Events = Object.keys(EventType).filter(t=>isNaN(+t)).reduce((p, c)=>{
    p[c] = ()=>DetailsEvents.emit(c)
    return p
}, {} as any)

type OrderDetailsState = {
    orders?: Order[]
}
type OrderDetailsProps = {
    cycle?: number
    corp: Corporation
    user: User
    full?: Boolean
    fields?: string[]
}
export class OrderDetails extends F.Fetcher<OrderDetailsProps, OrderDetailsState> {
    constructor(props){
        super(props)
        this.state = {}
        DetailsEvents.on(EventType[EventType.reloadOrders], ()=>this.fetch())
    }
    get fetchUrl() { 
        const {corp} = this.props
        return `/api/corp/orders/${corp._id}`
    }
    fetchState(data: any = {}){
        const {list} = data
        return {item: data, list, orders: list}
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
    items?: Item[]
}
type ItemDetailsProps = {
    corp: Corporation
    user: User
}
export class ItemDetails extends F.Fetcher<ItemDetailsProps, ItemDetailsState> {
    constructor(props){
        super(props)
        this.state = {}
        DetailsEvents.on(EventType[EventType.reloadItems], ()=>this.fetch());
        ['Sell', 'Delist', 'Pay'].forEach(cmd=>
            this[`on${cmd}`] = this[`on${cmd}`].bind(this))
    }
    get fetchUrl() { 
        const {corp} = this.props
        return `/api/corp/items/${corp._id}`
    }
    fetchState(data: any = {}){
        const {list} = data
        return {item: data, list, items: list}
    }
    get is_admin(){ return this.props.user.admin }
    is_owner(item: Item){
        return this.props.user && item && this.props.user._id == item.owner?._id }
    async onItemAction(item: Item, check: ()=>boolean, action: string, opt?: any){
        const {corp} = this.props
        if (!this.is_admin && !(this.is_owner(item) && check()))
            return
        const res = await util.wget(`/api/inventory/${corp.type}/${corp._id}/item/${item._id}/${action}`,
            Object.assign({method: 'PUT'}, opt))
        if (res.err)
            return this.setState({err: res.err})
        this.fetch()
        return true
    }
    async onPay(item: Item, patent: Patent){
        const {corp} = this.props
        const res = await this.onItemAction(item, ()=>corp.type==InstitutionType.Research,
            `pay/${patent._id}`)
        if (res)
            Events.reloadPatents()
    }
    async onDelist(item: Item){
        const check = ()=>![MarketType.Protected, MarketType.None].includes(item.market?.type)
        await this.onItemAction(item, check, 'delist')
    }
    async onSell(item: Item, target: Owner, price: number){
        const check = ()=>![MarketType.Protected, MarketType.Sale].includes(item.market?.type)
        await this.onItemAction(item, check, 'sell', {
            data: {target: target._id, dtype: target.type, price: price}})
    }
    rows(fields?: string[]){
        const {items = []} = this.state
        const rows = items.filter(util.not_depleted).map(i=><ItemRow className='menu-list-row'
            onPay={this.onPay} onSell={this.onSell} onDelist={this.onDelist}
            key={`item_row_${i._id}`} item={i} {...this.props} fields={fields}/>)
        return rows
    }
    render(){
        const fields = ['kind', 'location', 'data']
        return <RB.Container>
          <RB.Row className='menu-list-title'>
            <RB.Col>{L('res_cur')}</RB.Col>
          </RB.Row>
          <Delimeter />
          <ItemRowDesc {...this.props} fields={fields} />
          {this.rows(fields)}
        </RB.Container>
    }
}

type PatentDetailsState = {
    patents?: Patent[]
}
type PatentDetailsProps = {
    corp: Corporation
    user: User
}
export class PatentDetails extends F.Fetcher<PatentDetailsProps, PatentDetailsState> {
    constructor(props){
        super(props)
        this.state = {}
        DetailsEvents.on(EventType[EventType.reloadPatents], ()=>this.fetch())
    }
    get fetchUrl() { 
        const {corp} = this.props
        return `/api/corp/patents/${corp._id}`
    }
    fetchState(data: any = {}){
        const {list} = data
        return {item: data, list, patents: list}
    }
    async action_forward(patent: Patent){
        const {corp} = this.props
        let ret = util.wget(`/api/corp/patent/forward/${corp._id}`, {method: 'PUT',
            data: {_id: patent._id, requester: corp._id}});
    }
    async action_sell(patent: Patent){
        const {corp} = this.props
        let ret = util.wget(`/api/corp/patent/sell/${corp._id}`, {method: 'PUT',
            data: {_id: patent._id, requester: corp._id}});
    }
    async action_product(patent: Patent){
        const {corp} = this.props
        let ret = util.wget(`/api/corp/patent/product/${corp._id}`, {method: 'PUT',
            data: {_id: patent._id, requester: corp._id}});
    }
    rows(){
        const {patents = []} = this.state
        const {corp} = this.props
        const onAction = (name, patent)=>(async ()=>{
            if (await this[`action_${name}`](patent))
                this.fetch()
        })
        if (corp.type==InstitutionType.Research){
            return patents.sort((a, b)=>+Patent.ready(a) - +Patent.ready(b)).map(i=>
                <PatentLabItem onAction={onAction} key={`item_lab_${i._id}`}
                  patent={i} {...this.props} />)
        }
        const rows = patents.sort((a, b)=>+Patent.served(a, corp) - +Patent.served(b, corp))
            .map(i=><PatentRow onAction={onAction} key={`item_row_${i._id}`}
              patent={i} {...this.props} />)
        rows.unshift(<PatentRowDesc />)
        return rows
    }
    render(){
        return <RB.Container>
          <RB.Row className='menu-list-title'>
            <RB.Col>{L('patent_cur')}</RB.Col>
          </RB.Row>
          <Delimeter />
          {this.rows()}
        </RB.Container>
    }
}
import React from 'react'
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import {Corporation, CorporationType, Order, User} from '../common/entity'
import {Item, Patent} from '../common/entity'
import {ItemRow, ItemRowDesc} from '../util/Item'
import {PatentLabItem, PatentRow, PatentRowDesc} from '../util/Patent'
import {OrderRowCompact} from '../util/Order'
import * as util from '../common/util'
import {default as L, LR} from './locale'
import {Delimeter} from '../util/components'

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
    }
    get fetchUrl() { 
        const {corp} = this.props
        return `/api/corp/items/${corp._id}`
    }
    fetchState(data: any = {}){
        const {list} = data
        return {item: data, list, items: list}
    }
    rows(fields?: string[]){
        const {items = []} = this.state
        const rows = items.map(i=><ItemRow className='menu-list-row'
            onReload={()=>this.fetch()} key={`item_row_${i._id}`} item={i}
            {...this.props} fields={fields}/>)
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
    get fetchUrl() { return '/api/prices' }
    fetchState(data: any = {}){
        const {list} = data
        return {item: data, list, prices: list}
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
          <Delimeter />
          {items}
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
        if (corp.type==CorporationType.Research){
            return patents.map(i=><PatentLabItem onAction={onAction}
              key={`item_lab_${i._id}`} patent={i} {...this.props} />)
        }
        patents.sort((a, b)=>+b.served(corp) - +a.served(corp))
        const rows = patents.map(i=><PatentRow onAction={onAction}
          key={`item_row_${i._id}`} patent={i} {...this.props} />)
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
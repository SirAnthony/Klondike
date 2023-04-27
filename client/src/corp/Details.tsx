import React from 'react'
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import {Institution, InstitutionType, Order, User} from '../common/entity'
import {Item, MultiOwnedItem, Owner} from '../common/entity'
import {MarketType, Patent, Loan} from '../common/entity'
import {ItemRow, ItemRowDesc} from '../inventory'
import {PatentLabItem, PatentRow, PatentRowDesc} from '../inventory'
import {OrderRowCompact} from '../inventory'
import {InventoryEvents} from '../inventory'
import * as util from '../common/util'
import {default as L} from './locale'
import {Delimeter} from '../util/components'
import { TimeDetails } from 'src/inventory/Time'

type OrderDetailsState = {
    orders?: Order[]
    cycle: number
}
type OrderDetailsProps = {
    owner: Institution
    user: User
    full?: Boolean
    fields?: string[]
}
export class OrderDetails extends F.Fetcher<OrderDetailsProps, OrderDetailsState> {
    constructor(props){
        super(props)
        this.state = {cycle: 1}
        InventoryEvents.onreloadOrders(()=>this.fetch())
        InventoryEvents.ontimeChanged(()=>
            this.setState({cycle: TimeDetails.Time?.cycle}))
    }
    get fetchUrl() { 
        const {owner} = this.props
        return `/api/corp/orders/${owner._id}`
    }
    fetchState(data: any = {}){
        const {list} = data
        return {item: data, list, orders: list}
    }
    has(field: string){ return this.props.fields?.includes(field) }
    render(){
        const {cycle} = this.state
        const cur_orders = this.state.orders?.filter(o=>o.cycle==cycle)||[]
        const orders = cur_orders.map(order=><OrderRowCompact
            key={`order_row_compact_${order._id}`} order={order} />)
        const plan = cur_orders.reduce((p, c)=>p+Order.plan(c), 0)/(orders.length||1)
        return <RB.Container>
          <RB.Row>
            <RB.Col>{L('order', cycle)}</RB.Col>
            <RB.Col>{L('plan', (plan*100).toFixed(2))}</RB.Col>
          </RB.Row>
          {orders}
        </RB.Container>
    }
}

type ItemDetailsState = {
    items?: Item[]
}
type ItemDetailsProps = {
    owner: Owner
    user: User
}
class ItemDetailsBase extends F.Fetcher<ItemDetailsProps, ItemDetailsState> {
    constructor(props){
        super(props)
        InventoryEvents.onreloadItems(()=>this.fetch());
        ['Sell', 'Delist'].forEach(cmd=>
            this[`on${cmd}`] = this[`on${cmd}`].bind(this))
    }
    target: string
    get fetchUrl() { 
        const {owner} = this.props
        return `/api/inventory/${owner.type}/${owner._id}/${this.target}`
    }
    fetchState(data: any = {}){
        const {list} = data
        return {item: data, list, items: list}
    }
    get is_admin(){ return this.props.user.admin }
    is_owner(item: Item){
        const {relation} = this.props.user||{}
        const owners = [item?.owner?._id].concat(
            (item as MultiOwnedItem).owners?.map(o=>o._id)).filter(Boolean)
        return relation && owners.includes(relation._id)
    }
    async onItemAction(item: Item, check: ()=>boolean, action: string, opt?: any){
        const {owner} = this.props
        if (!this.is_admin && !(this.is_owner(item) && check()))
            return
        const res = await util.wget(`/api/inventory/${owner.type}/${owner._id}/item/${item._id}/${action}`,
            Object.assign({method: 'PUT'}, opt))
        if (res.err)
            return this.setState({err: res.err})
        this.fetch()
        return true
    }
    async onDelist(item: Item){
        const check = ()=>![MarketType.Protected, MarketType.None].includes(item.market?.type)
        await this.onItemAction(item, check, 'delist')
    }
    async onSell(item: Item, target: Owner, price: number){
        const check = ()=>[MarketType.None].includes(item.market?.type)
        await this.onItemAction(item, check, 'sell', {
            data: {target: target._id, dtype: target.type, price: price}})
    }
}

export class ItemDetails extends ItemDetailsBase {
    target = 'items'
    constructor(props){
        super(props)
        this.state = {}
        InventoryEvents.onreloadItems(()=>this.fetch());
        ['PatentPay', 'OrderPay', 'LoanPay'].forEach(cmd=>
            this[`on${cmd}`] = this[`on${cmd}`].bind(this))
    }
    async onPatentPay(item: Item, patent: Patent){
        const {owner} = this.props
        const res = await this.onItemAction(item, ()=>owner.type==InstitutionType.Research,
            `pay/patent/${patent._id}`)
        if (res)
            InventoryEvents.reloadPatents()
    }
    async onOrderPay(item: Item){
        const {owner} = this.props
        const res = await this.onItemAction(item, ()=>owner.type==InstitutionType.Corporation,
            `pay/order`)
        if (res)
            InventoryEvents.reloadOrders()
    }
    async onLoanPay(item: Item, loan: Loan){
        await this.onItemAction(item, ()=>true, `pay/loan/${loan._id}`) }
    rows(){
        const {items = []} = this.state
        const rows = items.filter(util.not_depleted).map(i=><ItemRow className='menu-list-row'
            onPatentPay={this.onPatentPay} onLoanPay={this.onLoanPay} onOrderPay={this.onOrderPay}
            onSell={this.onSell} onDelist={this.onDelist}
            key={`item_row_${i._id}`} item={i} {...this.props}/>)
        return rows
    }
    render(){
        return <RB.Container>
          <RB.Row className='menu-list-title'>
            <RB.Col>{L('res_cur')}</RB.Col>
          </RB.Row>
          <Delimeter />
          <ItemRowDesc className='menu-list-title' />
          {this.rows()}
        </RB.Container>
    }
}

export class PatentDetails extends ItemDetailsBase {
    target = 'patents'
    constructor(props){
        super(props)
        this.state = {}
        InventoryEvents.onreloadPatents(()=>this.fetch());
        ['Action'].forEach(cmd=>
            this[`on${cmd}`] = this[`on${cmd}`].bind(this))
    }
    onAction(name: string, patent: Patent){
        return async ()=>{
            if (await this[`action_${name}`](patent))
                this.fetch()
        }
    }
    async action_forward(patent: Patent){
        const {owner} = this.props
        let ret = util.wget(`/api/corp/patent/forward/${owner._id}`, {method: 'PUT',
            data: {_id: patent._id, requester: owner._id}});
    }
    async action_product(patent: Patent){
        const {owner} = this.props
        let ret = util.wget(`/api/corp/patent/product/${owner._id}`, {method: 'PUT',
            data: {_id: patent._id, requester: owner._id}});
    }
    rows(){
        const {items = []} = this.state
        const {owner} = this.props
        if (owner.type==InstitutionType.Research){
            return items.sort((a: Patent, b: Patent)=>+Patent.ready(a) - +Patent.ready(b)).map(i=>
                <PatentLabItem onAction={this.onAction} key={`item_lab_${i._id}`}
                    patent={i as Patent} {...this.props} />)
        }
        const rows = items.sort((a: Patent, b: Patent)=>+Patent.served(a, owner) - +Patent.served(b, owner))
            .map(i=><PatentRow onAction={this.onAction} onSell={this.onSell} key={`item_row_${i._id}`}
              patent={i as Patent} {...this.props} className='menu-list-row' />)
        rows.unshift(<PatentRowDesc className='menu-list-title' />)
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
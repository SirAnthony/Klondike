import React from 'react'
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import {Institution, InstitutionType, Order, User} from '../common/entity'
import {Item, MultiOwnedItem, Owner} from '../common/entity'
import {MarketType, Patent, Loan} from '../common/entity'
import {ItemRow, ItemRowDesc} from '.'
import {PatentLabItem, PatentRow, PatentRowDesc} from '.'
import {ProposalRow} from '.'
import {OrderRowCompact} from '.'
import {InventoryEvents} from '.'
import * as util from '../common/util'
import {default as L} from './locale'
import {Delimeter} from '../util/components'
import {TimeDetails} from './Time'
import * as date from '../common/date'

type OrderDetailsState = {
    orders?: Order[]
    rating?: number 
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
        this.state = {cycle: TimeDetails.Time?.cycle||1}
        InventoryEvents.onreloadOrders(()=>this.fetch())
        InventoryEvents.ontimeChanged(()=>
            this.setState({cycle: TimeDetails.Time?.cycle}))
    }
    get fetchUrl() { 
        const {owner} = this.props
        return `/api/corp/orders/${owner._id}`
    }
    fetchState(data: any = {}){
        const {list, rating} = data
        return {item: data, list, orders: list, rating}
    }
    has(field: string){ return this.props.fields?.includes(field) }
    render(){
        const {cycle, rating} = this.state
        const cur_orders = this.state.orders?.filter(o=>o.cycle==cycle)||[]
        const orders = cur_orders.map(order=><OrderRowCompact
            key={`order_row_compact_${order._id}`} order={order} />)
        const plan = cur_orders.reduce((p, c)=>p+Order.plan(c), 0)/(orders.length||1)
        return <RB.Container>
          <RB.Row>
            <RB.Col>{L('desc_order', cycle)}</RB.Col>
            <RB.Col>{L('desc_plan', (plan*100).toFixed(2))}</RB.Col>
            <RB.Col>{L('desc_rating', rating|0)}</RB.Col>
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
    asBox?: Boolean
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
    async onItemAction(item: Item, check: ()=>boolean, action: string, opt?: any) : Promise<boolean> {
        const {owner} = this.props
        if (!this.is_admin && !(this.is_owner(item) && check()))
            return false
        const res = await util.wget(`/api/inventory/${owner.type}/${owner._id}/item/${item._id}/${action}`,
            Object.assign({method: 'PUT'}, opt))
        if (res.err)
            return void this.setState({err: res.err})
        this.fetch()
        return true
    }
    async onDelist(item: Item) : Promise<boolean> {
        const check = ()=>![MarketType.Protected, MarketType.None].includes(item.market?.type|0)
        const action = item.market?.from?._id===this.props.owner._id ? 'delist' : 'reject'
        return await this.onItemAction(item, check, action, {data: {code: item.market.code}})
    }
    async onSell(item: Item, target: Owner, price: number) : Promise<boolean>  {
        const check = ()=>[MarketType.None].includes(item.market?.type|0)
        return await this.onItemAction(item, check, 'sell', {
            data: {target: target._id, dtype: target.type, price: price}})
    }
    wrap(box: React.ReactElement){
        if (!this.props.asBox)
            return box
        return <RB.Row>
          <RB.Col className='menu-box'>{box}</RB.Col>
        </RB.Row>
    }
}

export class ProposalDetails extends ItemDetailsBase {
    loop: NodeJS.Timer
    constructor(props){
        super(props)
        this.state = {}
        InventoryEvents.onreloadProposals(()=>this.fetch())
        this.loop = setInterval(()=>this.fetch(), date.ms.MIN*5)
        // InventoryEvents.ontimeChanged(()=>this.fetch())
    }
    get fetchUrl() { 
        const {owner} = this.props
        return `/api/inventory/${owner.type}/${owner._id}/proposals`
    }
    render(){
        const {items} = this.state
        if (!items || !items.length)
            return null
        const proposals = items?.map(i=><ProposalRow key={`proposal_row_${i._id}`}
            {...this.props} onRefuse={i=>this.onDelist(i)} item={i} />)
        return this.wrap(<RB.Container>
          <RB.Row><RB.Col>{L('desc_current_proposals')}</RB.Col></RB.Row>
          <Delimeter />
          {proposals}
        </RB.Container>)
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
    async onPatentPay(item: Item, patent: Patent) : Promise<boolean> {
        const {owner} = this.props
        const res = await this.onItemAction(item, ()=>owner.type==InstitutionType.Research,
            `pay/patent/${patent._id}`)
        if (res)
            InventoryEvents.reloadPatents()
        return res
    }
    async onOrderPay(item: Item, order: Order) : Promise<boolean> {
        const {owner} = this.props
        const res = await this.onItemAction(item, ()=>owner.type==InstitutionType.Corporation,
            `pay/order/${order._id}`)
        if (res)
            InventoryEvents.reloadOrders()
        return res
    }
    async onLoanPay(item: Item, loan: Loan) : Promise<boolean> {
        return await this.onItemAction(item, ()=>true, `pay/loan/${loan._id}`) }
    rows(){
        const {items = []} = this.state
        const rows = items.filter(util.not_depleted).map(i=><ItemRow className='menu-list-row'
            onPatentPay={this.onPatentPay} onLoanPay={this.onLoanPay} onOrderPay={this.onOrderPay}
            onSell={this.onSell} onDelist={this.onDelist}
            key={`item_row_${i._id}`} item={i} {...this.props}/>)
        return rows
    }
    render(){
        return this.wrap(<RB.Container>
          <RB.Row className='menu-list-title'>
            <RB.Col>{L('desc_items')}</RB.Col>
          </RB.Row>
          <Delimeter />
          <ItemRowDesc className='menu-list-title' />
          {this.rows()}
        </RB.Container>)
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
    onAction(name: string, patent: Patent)  {
        const method = this[`action_${name}`].bind(this)
        const fetch = this.fetch.bind(this)
        const setState = this.setState.bind(this)
        return async function() : Promise<boolean> {
            const ret = await method(patent)
            if (ret.err)
                return void setState({err: ret.err})
            fetch()
            return ret
        }
    }
    async action_forward(patent: Patent){
        const {owner} = this.props
        return util.wget(`/api/corp/patent/forward/${patent._id}`, {method: 'POST',
            data: {_id: patent._id, requester: owner._id}});
    }
    async action_product(patent: Patent){
        const {owner} = this.props
        return util.wget(`/api/corp/patent/product/${patent._id}`, {method: 'POST',
            data: {_id: patent._id, requester: owner._id}});
    }
    rows(){
        const {items = []} = this.state
        const {owner} = this.props
        if (owner.type==InstitutionType.Research){
            return items.sort((a: Patent, b: Patent)=>+a.ready - +b.ready).map(i=>
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
        return this.wrap(<RB.Container>
          <RB.Row className='menu-list-title'>
            <RB.Col>{L('desc_patents')}</RB.Col>
          </RB.Row>
          <Delimeter />
          {this.rows()}
        </RB.Container>)
    }
}
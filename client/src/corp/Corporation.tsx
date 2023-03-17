import React from 'react'
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import {Corporation as ECorp, CorporationRequest as ECorpReq, User} from '../common/entity'
import {Item as EItem, Resource as EResource} from '../common/entity'
import {ResourceType} from '../common/entity'
import * as util from '../common/util'
import {ControlBar} from '../util/controls'
import {ItemRow, ItemRowDesc} from '../util/Item'
import {default as L, LR} from './locale'

type CorpProps = {
    corp: ECorp
    cycle: number
    user: User
}

function Request(props: {req: ECorpReq}){
    const {req} = props
    return <RB.Container>
      <RB.Row>
        <RB.Col>{LR(`res_kind_${req.resource}`)}</RB.Col>
        <RB.Col>{req.required}</RB.Col>
        <RB.Col>{req.resource}</RB.Col>
      </RB.Row>
    </RB.Container>
}

function Requests(props: CorpProps){
    const {corp, cycle} = props
    const plan = corp.requests.reduce((p, c)=>{
        return p+c.resource/(c.required||1)
    }, 1)/(corp.requests.length||1)
    const reqs = corp.requests.map(req=><Request req={req} />)
    return <RB.Container>
      <RB.Row>
        <RB.Col>{L('order', cycle)}</RB.Col>
        <RB.Col>{L('plan', plan*100)}</RB.Col>
      </RB.Row>
      {reqs}
    </RB.Container>
}

export function Corporation(props: CorpProps){
    const {corp, cycle} = props
    return (<RB.Container>
      <RB.Row>
        <RB.Col className='menu-list-title'>{corp.name}</RB.Col>
      </RB.Row>
      <RB.Row>
        <RB.Col className='menu-box menu-box-col'>
          <RB.Container>
            <RB.Row className='menu-list-title'>
              <RB.Col>{L('balance')}</RB.Col>
            </RB.Row>
            <RB.Row className='menu-list-row'>
              <RB.Col>{L('currency')}</RB.Col>
              <RB.Col>{corp.credit||0}</RB.Col>
            </RB.Row>
          </RB.Container>
        </RB.Col>
        <RB.Col className='menu-box'>
          <Requests {...props} />
        </RB.Col>
      </RB.Row>
      <RB.Row>
        <RB.Col className='menu-box menu-box-col'>
          <PriceDetails {...props} />
        </RB.Col>
        <RB.Col className='menu-box'>
          <ItemDetails {...props} />
        </RB.Col>
      </RB.Row>
    </RB.Container>)
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
        const {prices} = data
        return {item: data, prices}
    }
    rows(){
        const {items = []} = this.state
        const rows = items.map(i=><ItemRow onReload={()=>this.fetch()}
            key={`item_row_${i._id}`} item={i} {...this.props}/>)
        return rows
    }
    render(){
        return <RB.Container>
          <RB.Row className='menu-list-title'>
            <RB.Col>{L('res_cur')}</RB.Col>
          </RB.Row>
          <ItemRowDesc {...this.props} />
          {this.rows()}
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
          <RB.Col>{LR(`resource_${k}`)}</RB.Col>
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

type CorpDetailsState = {
    corp?: ECorp
}

type CorpDetailsProp = {
    user: User
    id?: string
    onClose?: ()=>void
}


export default class CorpDetails extends F.Fetcher<CorpDetailsProp, CorpDetailsState> {
    constructor(props){
        super(props)
        this.state = {}
    }
    get fetchUrl(){
        const {id = ''} = this.props
        return `/api/corp/${id}`
    }
    fetchState(data: any = {}){
        const {corp} = data
        return {item: data, corp}
    }
    render(){
        const {corp} = this.state
        return <RB.Container className="menu-container">
          <ControlBar title={L('interface')} onClose={this.props.onClose} />
          {corp ? <Corporation corp={corp} cycle={1} user={this.props.user} /> : <div>{L('not_found')}</div>}
        </RB.Container>
    }
}
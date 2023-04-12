import React from 'react'
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import {User} from '../common/entity'
import {default as L, LR} from './locale'
import {Delimeter} from '../util/components'
import {InventoryEvents, InventoryEventType as IET} from './index'

type PriceDetailsState = {
    prices?: {ResourceType: number}
}

export class PriceFetcher<P, S> extends F.Fetcher<P, PriceDetailsState> {
    cacheClass = PriceFetcher
    constructor(props){
        super(props)
        this.state = {}
        InventoryEvents.onreloadPrices(()=>{
            this.cacheClass._cache = undefined
            this.fetch()
        })
    }
    get fetchUrl() { return '/api/prices' }
    fetchState(data: any = {}){
        const {list} = data
        return {item: data, list, prices: list}
    }
}

type PriceDetailsProps = {
    user: User
}

export class PriceDetails extends PriceFetcher<PriceDetailsProps, {}> {
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


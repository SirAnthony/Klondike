import React from 'react'
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import {Corporation as ECorp, User} from '../common/entity'
import {ResourceType} from '../common/entity'
import * as util from '../common/util'
import {ControlBar} from '../util/controls'
import {ItemDetails, PriceDetails, OrderDetails} from './Details'
import {default as L, LR} from './locale'

type CorpProps = {
    corp: ECorp
    cycle: number
    user: User
}

export function Corporation(props: CorpProps){
    const {corp} = props
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
          <OrderDetails {...props} fields={['plan']} />
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
import React from 'react'
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import {Corporation as ECorp, CorporationRequest as ECorpReq, User} from '../common/entity'
import * as util from '../common/util'
import {ControlBar} from '../util/controls'
import L from './locale'

type CorpProps = {
    corp: ECorp
    cycle: number
}

function Request(props: {req: ECorpReq}){
    const {req} = props
    return <RB.Container>
      <RB.Row>
        <RB.Col>{L(`material_${req.resource}`)}</RB.Col>
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
          <RB.Container>
            <RB.Row className='menu-list-title'>
              <RB.Col>{L('market_prices')}</RB.Col>
            </RB.Row>
          </RB.Container>
        </RB.Col>
        <RB.Col className='menu-box'></RB.Col>
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
          {corp ? <Corporation corp={corp} cycle={1} /> : <div>{L('not_found')}</div>}
        </RB.Container>
    }
}
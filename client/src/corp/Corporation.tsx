import React from 'react'
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import {Corporation as ECorp, InstitutionType, User} from '../common/entity'
import {ControlBar} from '../util/controls'
import {ItemDetails, OrderDetails} from './Details'
import {PatentDetails} from './Details'
import {RatingDetails} from './Rating'
import {PriceDetails, BudgetDetails} from '../inventory'
import {default as L} from './locale'

type CorpProps = {
    corp: ECorp
    user: User
}

export function Corporation(props: CorpProps){
    const {corp} = props
    return (<RB.Container className='container-full'>
      <RB.Row>
        <RB.Col className='menu-list-title'>{corp.name}</RB.Col>
      </RB.Row>
      <RB.Row>
        <BudgetDetails entity={props.corp} user={props.user} />
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
      <RB.Row>
        <RB.Col className='menu-box menu-box-col'>
          <RatingDetails />
        </RB.Col>
        <RB.Col className='menu-box'>
          <PatentDetails {...props} />
        </RB.Col>
      </RB.Row>
    </RB.Container>)
}

export function Laboratory(props: CorpProps){
    const {corp} = props
    return <RB.Container className='container-full'>
      <RB.Row>
        <RB.Col className='menu-list-title'>{corp.name}</RB.Col>
      </RB.Row>
      <RB.Row>
        <RB.Col className='menu-box-col'>
          <RB.Container>
            <RB.Row>
              <BudgetDetails entity={props.corp} user={props.user} />
            </RB.Row>
            <RB.Row><RB.Col className='menu-box menu-box-col'>
              <PriceDetails {...props} />
            </RB.Col></RB.Row>
          </RB.Container>
        </RB.Col>
        <RB.Col>
          <RB.Container><RB.Row><RB.Col className='menu-box'>
            <PatentDetails {...props} />
          </RB.Col></RB.Row>
          <RB.Row><RB.Col className='menu-box'>
            <ItemDetails {...props} />
          </RB.Col></RB.Row></RB.Container>
        </RB.Col>
      </RB.Row>
    </RB.Container>
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
    view(){
        const {corp} = this.state
        if (!corp)
            return <div>{L('not_found')}</div>
        return corp.type==InstitutionType.Research ?
            <Laboratory corp={corp} user={this.props.user} /> :
            <Corporation corp={corp} user={this.props.user} />
    }
    render(){
        const {corp} = this.state
        return <RB.Container className="menu-container-full">
          <ControlBar title={L('interface', corp?.name||'')} onClose={this.props.onClose} />
          {this.view()}
        </RB.Container>
    }
}
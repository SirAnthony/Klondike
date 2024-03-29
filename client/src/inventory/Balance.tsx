import React from 'react'
import * as RB from 'react-bootstrap'
import {Institution, Owner, User} from '../common/entity'
import {InstitutionType, Loan} from '../common/entity'
import {Delimeter} from '../util/components'
import {OwnerValueSelectTrigger} from '../util/popovers'
import {InventoryEvents} from '../inventory'
import * as F from '../Fetcher'
import {default as L, LR} from './locale'
import * as util from '../common/util'
import * as date from '../common/date'


type BalanceDetailsState = {
    item?: {
        user: number
        entity: {
            credit: number
        } & Owner
    }
}
type BalanceDetailsProps = {}
export class BalanceDetails extends F.Fetcher<BalanceDetailsProps, BalanceDetailsState> {
    interval: NodeJS.Timer
    constructor(props){
        super(props)
        this.state = {}
        InventoryEvents.onreloadBalance(()=>this.fetch())
        this.interval = setInterval(()=>this.fetch(), date.ms.MIN/2)
    }
    get fetchUrl(){ return '/api/balance' }
    render(){
        const {item} : BalanceDetailsState = this.state
        const {entity} = item||{}
        return <RB.Container className='nav-link'><RB.Row className='justify-content-center'>
          <RB.Col sm={2}>{L('balance_user')}</RB.Col>
          <RB.Col sm={2}>{item?.user|0}</RB.Col>
          {entity && <RB.Col sm={2}>
            {L(`balance_type_${entity.type}`, entity.name)}
          </RB.Col>}
          {entity && <RB.Col sm={2}>{entity.credit|0}</RB.Col>}
        </RB.Row></RB.Container>
    }
}

type BudgetDetailsProps = {
    entity: Institution
    user: User
}
type BudgetDetailsState = {
    item?: {
        entity: {
            credit: number
            cost: number
        } & Owner
        loans?: Loan[]
    }
}
export class BudgetDetails extends F.Fetcher<BudgetDetailsProps, BudgetDetailsState> {
    constructor(props){
        super(props)
        this.state = {}
        this.onTransfer = this.onTransfer.bind(this)
        InventoryEvents.onreloadBalance(()=>this.fetch())
    }
    get base_url(){
        const {entity} = this.props
        return `/api/inventory/${entity.type}/${entity._id}`
    }
    get fetchUrl(){ return `${this.base_url}/balance` }
    async onTransfer(owner: Owner, amount: number) : Promise<boolean> {
        this.setState({err: null})
        const res = await util.wget(`${this.base_url}/transfer`,
            {method: 'POST', data: {dtype: owner.type, target: owner._id, amount}})
        if (res.err)
            return void this.setState({err: res.err})
        this.fetch()
        return true
    }
    expenses(){
        const {item} : BudgetDetailsState = this.state
        const {entity} = item||{}
        const loan_credit = item?.loans?.filter(f=>
            f.creditor._id==entity._id && f.amount).map(f=><RB.Row>
          <RB.Col>{f.lender.name}</RB.Col>
          <RB.Col>{f.amount}</RB.Col>
        </RB.Row>)
        if (!entity?.cost && !loan_credit?.length)
              return null
        return <>
          <RB.Row>
            <RB.Col>{L('expenses')}</RB.Col> 
          </RB.Row>
          <Delimeter />
          {entity?.cost && <RB.Row>
            <RB.Col>{L('current_expenses')}</RB.Col>
            <RB.Col>{entity.cost}</RB.Col>
          </RB.Row>}
          {!!loan_credit?.length && <RB.Row>
            <RB.Col>{L('loans')}</RB.Col> 
          </RB.Row>}
          {loan_credit}
        </>
    }
    render(){
        const {item} : BudgetDetailsState = this.state
        const {entity} = item||{}
        const inputRange: [number, number] = [1, entity?.credit|0]
        const ownersExclude = []
        const loan_debit = item?.loans?.filter(f=>
            f.lender._id==entity._id && f.amount).map(f=><RB.Row>
          <RB.Col>{f.creditor.name}</RB.Col>
          <RB.Col>{f.amount}</RB.Col>
        </RB.Row>)
        return <RB.Col className='menu-box menu-box-col'>
        <RB.Container>
          <RB.Row className='menu-list-title'>
            <RB.Col>{L('balance')}</RB.Col>
          </RB.Row>
          <Delimeter />
          <RB.Row className='menu-list-row'>
            <RB.Col>{L('currency')}</RB.Col>
            <RB.Col>{entity?.credit|0}</RB.Col>
          </RB.Row>
          <RB.Row className='menu-input-row justify-content-center'>
            <OwnerValueSelectTrigger onClick={this.onTransfer} inputRange={inputRange}
              desc={L('act_transfer')} valDesc={LR('res_desc_value')}
              exclude={ownersExclude} source={entity}/>
          </RB.Row>
          {!!loan_debit?.length && <RB.Row>
            <RB.Col>{L('loans')}</RB.Col> 
          </RB.Row>}
          {loan_debit}
          {this.expenses()}
        </RB.Container></RB.Col>
    }
}
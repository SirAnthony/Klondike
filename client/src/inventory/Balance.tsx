import React from 'react'
import * as RB from 'react-bootstrap'
import {Institution, Owner, User, ID} from '../common/entity'
import {Delimeter} from '../util/components'
import {NumberInput, OwnerSelect} from '../util/inputs'
import {ErrorMessage} from '../util/errors'
import {ClientError} from '../common/errors'
import {Modal} from './modal'
import {InventoryEvents} from '../inventory'
import * as F from '../Fetcher'
import {default as L, LR} from './locale'
import * as util from '../common/util'
import * as date from '../common/date'

type BalanceDetailsState = {
    balance?: {
        user: number
        relation?: Owner
        institution?: number
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
    fetchState(data: any){
        const time = new date.Time(data)
        InventoryEvents.timeChanged()
        return {item: data, time}
    }
    render(){
        const {balance} = this.state
        const {relation} = balance||{}
        return <RB.Container className='nav-link'><RB.Row className='justify-content-center'>
          <RB.Col sm={2}>{L('balance_user')}</RB.Col>
          <RB.Col sm={2}>{balance?.user|0}</RB.Col>
          {relation && <RB.Col sm={2}>
            {L(`balance_type_${relation.type}`, relation.name)}
          </RB.Col>}
          {relation && <RB.Col sm={2}>{balance.institution|0}</RB.Col>}
        </RB.Row></RB.Container>
    }
}

type BudgetDetailsProps = {
    entity: Institution
    user: User
}

export function BudgetDetails(props: BudgetDetailsProps){
    const {entity} = props
    const [credit, setCredit] = React.useState(entity.credit||0)
    const [transferee, setTransferee] = React.useState(null)
    const [amount, setAmount] = React.useState(undefined)
    const [showTransfer, setShowTransfer] = React.useState(false)
    const [showConfirm, setShowConfirm] = React.useState(false)
    const [error, setError] = React.useState(null)
    const wrapReset = fn=>(...args)=>{
        setShowConfirm(false)
        setError(null)
        fn(...args)
    }
    const onTransfer = ()=>{
        if (!transferee || !amount)
            return setError(new ClientError(LR('error_empty_select')))
        if (amount>credit)
            return setError(new ClientError(LR('error_value_high')))
        if (amount<0)
            return setError(new ClientError(LR('error_value_low')))
        setShowConfirm(true)
    }
    const onConfirm = async ()=>{
        let res = await util.wget(`/api/corp/transfer/${entity._id}`, {method: 'POST',
            data: {stype: entity.type, dtype: transferee.type,
                target: transferee._id, amount}})
        if (res.err)
            return setError(res.err)
        setCredit(res.data?.credit)
    }
    return <RB.Col className='menu-box menu-box-col'>
    <RB.Container>
      <RB.Row className='menu-list-title'>
        <RB.Col>{L('balance')}</RB.Col>
      </RB.Row>
      <Delimeter />
      <RB.Row className='menu-list-row'>
        <RB.Col>{L('currency')}</RB.Col>
        <RB.Col>{credit}</RB.Col>
      </RB.Row>
      <RB.Row className='menu-input-row'><RB.Col>
          <RB.Button onClick={()=>setShowTransfer(!showTransfer)}>{LR('act_transfer_show')}</RB.Button>
      </RB.Col></RB.Row>
      {error && <RB.Row>
        <RB.Col><ErrorMessage field={error} /></RB.Col>
      </RB.Row>}
      {showTransfer && <OwnerSelect onChange={wrapReset(setTransferee)}
        value={transferee} filter={(val: ID)=>val._id!=entity._id} />}
      {showTransfer && <RB.Row className='menu-input-row'>
        <RB.Col>
          <NumberInput onChange={wrapReset(setAmount)} value={amount}
            placeholder={LR('res_desc_value')} />
        </RB.Col>
      </RB.Row>}
      {showTransfer && <RB.Row className='menu-input-row'>
        <RB.Col>
          <RB.Button onClick={wrapReset(onTransfer)}>{LR('act_transfer')}</RB.Button>
        </RB.Col>
      </RB.Row>}
      <Modal show={showConfirm} onReject={wrapReset(()=>{})} onAgree={wrapReset(onConfirm)}>
        {LR('act_transfer')+` ${amount} ${transferee?.name}`}
      </Modal>
    </RB.Container></RB.Col>
}
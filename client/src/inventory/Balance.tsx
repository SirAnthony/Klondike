import React from 'react'
import * as RB from 'react-bootstrap'
import {Institution, User, ID} from '../common/entity'
import {Delimeter} from '../util/components'
import {NumberInput, OwnerSelect} from '../util/inputs'
import {ErrorMessage} from '../util/errors'
import {ClientError} from '../common/errors'
import {Modal} from './modal'
import {default as L, LR} from './locale'
import * as util from '../common/util'

type BalanceProps = {
    entity: Institution
    user: User
}

export function Balance(props: BalanceProps){
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
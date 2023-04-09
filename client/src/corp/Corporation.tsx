import React from 'react'
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import {Corporation as ECorp, InstitutionType, User, ID} from '../common/entity'
import {ControlBar} from '../util/controls'
import {ItemDetails, PriceDetails, OrderDetails} from './Details'
import {PatentDetails} from './Details'
import {default as L, LR} from './locale'
import {Delimeter} from '../util/components'
import {NumberInput, OwnerSelect} from '../util/inputs'
import {ErrorMessage} from '../util/errors'
import {ClientError} from '../common/errors'
import * as util from '../common/util'

type CorpProps = {
    corp: ECorp
    user: User
}

export function CorpBalance(props: CorpProps){
    const {corp} = props
    const [credit, setCredit] = React.useState(corp.credit||0)
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
        let res = await util.wget(`/api/corp/transfer/${corp._id}`, {method: 'POST',
            data: {target: transferee._id, amount}})
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
      {showTransfer && <RB.Row>
        <RB.Col>
          <OwnerSelect onChange={wrapReset(setTransferee)} value={transferee}
            filter={(val: ID)=>val._id!=corp._id} />
        </RB.Col>
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
      <RB.Modal show={showConfirm} onHide={wrapReset(()=>{})}>
        <RB.ModalHeader closeButton>
          <RB.ModalTitle>{LR('confirmation_needed')}</RB.ModalTitle>
        </RB.ModalHeader>
        <RB.ModalBody>{LR('act_transfer')+` ${amount} ${transferee?.name}`}</RB.ModalBody>
        <RB.ModalFooter>
          <RB.Button onClick={wrapReset(()=>{})}>{LR('act_disagree')}</RB.Button>
          <RB.Button onClick={wrapReset(onConfirm)}>{LR('act_agree')}</RB.Button>
        </RB.ModalFooter>
      </RB.Modal>
    </RB.Container></RB.Col>
}

export function Corporation(props: CorpProps){
    const {corp} = props
    return (<RB.Container className='container-full'>
      <RB.Row>
        <RB.Col className='menu-list-title'>{corp.name}</RB.Col>
      </RB.Row>
      <RB.Row>
        <CorpBalance {...props} />
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
              <CorpBalance {...props} />
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
import React from 'react'
import * as RB from 'react-bootstrap'
import {Corporation, Item, Patent} from '../common/entity'
import {Owner, Loan, InstitutionType} from '../common/entity'
import {NumberInput, OwnerSelect, PatentSelect} from './inputs'
import L from '../common/locale'
import {LoanSelect} from '../corp/List'

type PatentSelectProps = {
    item: Item
    owner: Owner
    desc: string
    onClick: (patent: Patent)=>void
}
export function PatentSelectTrigger(props: PatentSelectProps){
    const {item, owner, desc} = props
    const [patent, setPatent] = React.useState(null)
    const onClick = ()=>patent && props.onClick(patent)
    const btn = <RB.Popover>
      <RB.PopoverBody>
        <PatentSelect value={patent} owner={owner} item={item} onChange={setPatent} />
        <RB.Button disabled={!patent} onClick={onClick}>{desc}</RB.Button>
      </RB.PopoverBody>
    </RB.Popover>
    return <RB.OverlayTrigger placement='top' trigger={'click'} overlay={btn} rootClose={true}>
      <RB.Button>{desc}</RB.Button>
    </RB.OverlayTrigger>
}

function RangeWarning(props: {value: number, range?: [number, number]}){
    const {value, range} = props
    if (!range)
        return null
    if (value < range[0])
        return <div className='error'>{L('error_value_low')}</div>
    if (value > range[1])
        return <div className='error'>{L('error_value_high')}</div>
    return null
}

type LoanSelectProps = {
    desc: string
    placement?: any
    source?: Owner
    inputRange?: [number, number]
    onClick: (loan: Loan)=>void
}
export function LoanSelectTrigger(props: LoanSelectProps){
    const {desc, source, inputRange} = props
    const [loan, setLoan] = React.useState(null)
    const onClick = ()=>props.onClick(loan)
    const filter = (l: Loan)=>
        +l.creditor.type==+source.type && l.creditor._id==source._id &&
        l.amount>= inputRange[0] && l.amount<=inputRange[1] 
    const btn = <RB.Popover>
      <RB.PopoverBody>
        <LoanSelect value={loan} owner={source} onChange={setLoan} filter={filter} />
        <RB.Row className='menu-input-row'>
          <RB.Button disabled={!loan} onClick={onClick}>{desc}</RB.Button>
        </RB.Row>
      </RB.PopoverBody>
    </RB.Popover>
    return <RB.OverlayTrigger placement={props.placement||'top'} trigger={'click'}
      overlay={btn} rootClose={true}>
      <RB.Button>{desc}</RB.Button>
    </RB.OverlayTrigger>
}

type OwnerValueSelectProps = {
    desc: string
    valDesc: string
    placement?: any
    exclude: InstitutionType[]
    source?: Owner
    inputRange?: [number, number]
    onClick: (owner: Owner, value: number)=>void
}
export function OwnerValueSelectTrigger(props: OwnerValueSelectProps){
    const {desc, valDesc, exclude, source, inputRange} = props
    const [owner, setOwner] = React.useState(null)
    const [value, setValue] = React.useState(null)
    const checkRange = (val: number)=>!inputRange ||
        (val>=inputRange[0] && val<=inputRange[1])
    const check = ()=>owner?._id && !isNaN(+owner?.type) &&
        !isNaN(+value) && checkRange(+value)
    const onClick = ()=>check() && props.onClick(owner, value)
    const btn = <RB.Popover>
      <RB.PopoverBody>
        <OwnerSelect value={owner} onChange={setOwner} exclude={exclude}
          filter={source ? v=>!(+v.type===+source.type&&''+v._id===''+source._id) : undefined} />
        <RangeWarning value={value} range={inputRange} />
        <NumberInput value={value} onChange={setValue} placeholder={valDesc} />
        <RB.Row className='menu-input-row'>
          <RB.Button disabled={!check()} onClick={onClick}>{desc}</RB.Button>
        </RB.Row>
      </RB.PopoverBody>
    </RB.Popover>
    return <RB.OverlayTrigger placement={props.placement||'top'} trigger={'click'}
      overlay={btn} rootClose={true}>
      <RB.Button>{desc}</RB.Button>
    </RB.OverlayTrigger>
}
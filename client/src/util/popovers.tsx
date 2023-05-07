import React from 'react'
import * as RB from 'react-bootstrap'
import {Item, Patent, Order, OwnerMatch, Module} from '../common/entity'
import {Owner, Loan, InstitutionType, Location} from '../common/entity'
import {LocationSelect, NumberInput, OwnerSelect} from './inputs'
import {OrderSelect, PatentSelect} from './inputs'
import {ModuleSelect} from '../ship/List'
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

type OrderSelectProps = {
    item: Item
    owner: Owner
    desc: string
    onClick: (order: Order)=>void
}
export function OrderSelectTrigger(props: OrderSelectProps){
    const {item, owner, desc} = props
    const [order, setPatent] = React.useState(null)
    const onClick = ()=>order && props.onClick(order)
    const btn = <RB.Popover>
      <RB.PopoverBody>
        <OrderSelect value={order} owner={owner} item={item} onChange={setPatent} />
        <RB.Button disabled={!order} onClick={onClick}>{desc}</RB.Button>
      </RB.PopoverBody>
    </RB.Popover>
    return <RB.OverlayTrigger placement='top' trigger={'click'} overlay={btn} rootClose={true}>
      <RB.Button>{desc}</RB.Button>
    </RB.OverlayTrigger>
}

type ModuleSelectProps = {
    owner: Owner
    desc: string
    onClick: (module: Module)=>void
}
export function ModuleSelectTrigger(props: ModuleSelectProps){
    const {owner, desc} = props
    const [module, setModule] = React.useState(null)
    const onClick = ()=>module && props.onClick(module)
    const btn = <RB.Popover>
      <RB.PopoverBody>
        <ModuleSelect value={module} owner={owner} onChange={setModule} />
        <RB.Button disabled={!module} onClick={onClick}>{desc}</RB.Button>
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
    onClick: (loan: Loan)=>Promise<boolean>
}
export function LoanSelectTrigger(props: LoanSelectProps){
    const {desc, source, inputRange} = props
    const [loan, setLoan] = React.useState(null)
    const onClick = async ()=>(await props.onClick(loan)) && document.body.click()
    const filter = (l: Loan)=>
        +l.creditor.type===+source.type && l.creditor._id===source._id &&
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

type LocationSelectProps = {
    desc: string
    location: Location
    placement?: any
    onClick: (location: Location)=>Promise<boolean>
}
export function LocationSelectTrigger(props: LocationSelectProps){
    const {desc} = props
    const [location, setLocation] = React.useState(props.location)
    const onClick = async ()=>(await props.onClick(location)) && document.body.click()
    const check = ()=>location?._id && !isNaN(+location?.pos?.col) && !isNaN(+location?.pos?.row)
    const btn = <RB.Popover>
      <RB.PopoverBody>
        <LocationSelect value={location} onChange={setLocation} />
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

type OwnerValueSelectProps = {
    desc: string
    valDesc: string
    placement?: any
    exclude: InstitutionType[]
    rangeExclude?: InstitutionType[]
    source?: Owner
    nullable?: boolean
    inputRange?: [number, number]
    onClick: (owner: Owner, value: number)=>Promise<boolean>
}
export function OwnerValueSelectTrigger(props: OwnerValueSelectProps){
    const {desc, valDesc, exclude, source, nullable, inputRange} = props
    const [owner, setOwner] = React.useState(null)
    const [value, setValue] = React.useState(null)
    const skipCheck = props.rangeExclude?.includes(+owner?.type)
    const checkRange = (val: number)=>!inputRange || skipCheck ||
        (val>=inputRange[0] && val<=inputRange[1])
    const check = ()=>nullable || (owner?._id &&
        !isNaN(+owner?.type) && !isNaN(+value) && checkRange(+value))
    const onClick = async ()=>check() &&
        (await props.onClick(owner, value)) && document.body.click()
    const btn = <RB.Popover>
      <RB.PopoverBody>
        <OwnerSelect value={owner} onChange={setOwner} exclude={exclude} nullable={nullable}
          filter={source ? v=>!OwnerMatch(v, source) : undefined} />
        {!skipCheck && <RangeWarning value={value} range={inputRange} />}
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

export function JSONPopoverOverlay(props: {children: React.ReactElement, data: any}){
    const {children, data} = props
    const popover = <RB.Popover>
      <RB.PopoverBody>{JSON.stringify(data)}</RB.PopoverBody>
    </RB.Popover>
    return <RB.OverlayTrigger placement='top' trigger={['hover']} rootClose={true}
      overlay={popover}>
      <RB.Container>{children}</RB.Container>
    </RB.OverlayTrigger>
}
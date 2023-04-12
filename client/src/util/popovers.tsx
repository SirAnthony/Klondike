import React from 'react'
import * as RB from 'react-bootstrap'
import {Corporation, Item, Patent, Owner, InstitutionType} from '../common/entity'
import {NumberInput, OwnerSelect, PatentSelect} from './inputs'
import L from '../common/locale'

type PatentSelectProps = {
    item: Item
    corp: Corporation
    desc: string
    onClick: (patent: Patent)=>void
}
export function PatentSelectTrigger(props: PatentSelectProps){
    const {item, corp, desc} = props
    const [patent, setPatent] = React.useState(null)
    const onClick = ()=>patent && props.onClick(patent)
    const btn = <RB.Popover>
      <RB.PopoverBody>
        <PatentSelect value={patent} corp={corp} item={item} onChange={setPatent} />
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

type OwnerSelectProps = {
    desc: string
    valDesc: string
    placement?: any
    exclude: InstitutionType[]
    inputRange?: [number, number]
    onClick: (owner: Owner, value: number)=>void
}
export function OwnerValueSelectTrigger(props: OwnerSelectProps){
    const {desc, valDesc, exclude, inputRange} = props
    const [owner, setOwner] = React.useState(null)
    const [value, setValue] = React.useState(null)
    const checkRange = (val: number)=>!inputRange ||
        (val>=inputRange[0] && val<=inputRange[1])
    const check = ()=>owner?._id && !isNaN(+owner?.type) &&
        !isNaN(+value) && checkRange(+value)
    const onClick = ()=>check() && props.onClick(owner, value)
    const btn = <RB.Popover>
      <RB.PopoverBody>
        <OwnerSelect value={owner} onChange={setOwner} exclude={exclude} />
        <RangeWarning value={value} range={inputRange} />
        <NumberInput value={value} onChange={setValue} placeholder={valDesc} />
        <RB.Button disabled={!check()} onClick={onClick}>{desc}</RB.Button>
      </RB.PopoverBody>
    </RB.Popover>
    return <RB.OverlayTrigger placement={props.placement||'top'} trigger={'click'}
      overlay={btn} rootClose={true}>
      <RB.Button>{desc}</RB.Button>
    </RB.OverlayTrigger>
}
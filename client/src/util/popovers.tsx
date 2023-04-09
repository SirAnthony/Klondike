import React from 'react'
import * as RB from 'react-bootstrap'
import {Corporation, Item, Patent} from '../common/entity'
import {PatentSelect} from './inputs'

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
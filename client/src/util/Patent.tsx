import React from 'react'
import * as RB from 'react-bootstrap'
import {ID, Patent, Corporation, User} from '../common/entity'
import * as util from '../common/util'
import L from '../common/locale'
import * as _ from 'lodash'
import {ClientError} from '../common/errors'
import {ErrorMessage} from './errors'
import {IDField} from '../util/components'

type RowDescProps = {
    className?: string
}
export function PatentRowDesc(props: RowDescProps){
    return <RB.Row className={props.className}>
      <RB.Col>{L('item_desc_id')}</RB.Col>
      <RB.Col>{L('item_desc_name')}</RB.Col>
      <RB.Col>{L('patent_desc_weight')}</RB.Col>
      <RB.Col>{L('patent_desc_kind')}</RB.Col>
      <RB.Col>{L('patent_desc_ownership')}</RB.Col>
      <RB.Col>{L('item_desc_actions')}</RB.Col>
    </RB.Row>
}

const OwnerListPopover = (patent: Patent)=>{
    const owners = _.uniqBy(patent.owners, p=>p._id).map(o=>
        <span key={`corp_name_${o._id}`}>{o.name}</span>)
    return <RB.Popover id={`popover_corps_${patent._id}`}>
      <RB.PopoverBody>
        {owners}
      </RB.PopoverBody>
    </RB.Popover>
}

type RowProps = {
    corp: Corporation
    patent: Patent
    onReload?: ()=>void
} & RowDescProps
export function PatentRow(props: RowProps){
    const {patent, corp} = props
    const len = patent.owners.length
    const owners = patent.owners.reduce((p, f)=>p + +(f._id==corp._id), 0)
    const ownership = patent.owners.length<2 ? L('patent_ownership_full') :
        L(`patent_ownership_shared`)+` [${owners}/${len}]`
    return <RB.Row key={`patent_${patent._id}`} className={props.className}>
        <RB.Col><IDField item={patent} /></RB.Col>
        <RB.Col>{patent.name}</RB.Col>
        <RB.Col>{L(`patent_weigth_${patent.weight}`)}</RB.Col>
        <RB.Col>{L(`patent_kind_${patent.kind}`)}</RB.Col>
        <RB.Col>
          <RB.OverlayTrigger placement='top' trigger={['hover', 'focus']}
            overlay={OwnerListPopover(patent)}>
            <span>{ownership}</span>
          </RB.OverlayTrigger>
        </RB.Col>
        <RB.Col>actions</RB.Col>
    </RB.Row>
}
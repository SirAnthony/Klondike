import React from 'react'
import * as RB from 'react-bootstrap'
import {Patent, Corporation, InstitutionType} from '../common/entity'
import {IDField} from '../util/components'
import L from '../common/locale'
import * as _ from 'lodash'

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
    onAction?: (action: string, patent: Patent)=>()=>void
} & RowDescProps
export function PatentRow(props: RowProps){
    const {patent, corp} = props
    const len = patent.owners.length
    const owners = patent.owners.reduce((p, f)=>p + +(f._id==corp._id), 0)
    const ownership = patent.owners.length<2 ? L('patent_ownership_full') :
        L(`patent_ownership_shared`)+` [${owners}/${len}]`
    const is_served = patent.served(corp)
    const cls = props.className+(is_served ? 'patent-served' : '')
    return <RB.Row key={`patent_${patent._id}`} className={cls}>
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
        <RB.Col>
          <PatentActions {...props} />
        </RB.Col>
    </RB.Row>
}

export function PatentActions(props: RowProps){
    const {patent, corp, onAction} = props
    if (corp.type==InstitutionType.Research)
        return <RB.Button>{L('act_pay')}</RB.Button>
    const is_served = patent.served(corp)
    return <RB.Container>
      {!is_served  && <RB.Row><RB.Col>
        <RB.Button onClick={onAction('forward', patent)}>
          {L('act_forward_center')}</RB.Button>
      </RB.Col></RB.Row>}
      <RB.Row>
        {!is_served && <RB.Col>
          <RB.Button onClick={onAction('sell', patent)}>
            {L('act_sell')}</RB.Button>
        </RB.Col>}
        <RB.Col>
          <RB.Button onClick={onAction('product', patent)}>
            {L('act_product')}</RB.Button>
        </RB.Col>
      </RB.Row>
    </RB.Container>
}

export function PatentLabItem(props: RowProps){
    const {patent} = props
    const owners = _.uniqBy(patent.owners, p=>p._id).map(o=>
        <span key={`corp_name_${o._id}`}>{o.name}</span>)
    const costs = patent.resourceCost.map(r=><RB.Row>
      <RB.Col>{L(`res_kind_${r.kind}`)}</RB.Col>
      <RB.Col>{r.value}</RB.Col>
      <RB.Col>{r.provided|0}</RB.Col>
    </RB.Row>)
    return <RB.Container className='menu-list-box'><RB.Row><RB.Col><RB.Container>
      <RB.Row><IDField item={patent} /></RB.Row>
      <RB.Row>
        <RB.Col>{L('item_desc_name')}</RB.Col>
        <RB.Col>{patent.name}</RB.Col>
      </RB.Row>
      <RB.Row>
        <RB.Col>{L('patent_desc_kind')+' / '+L('patent_desc_weight')}</RB.Col>
        <RB.Col>{L(`patent_kind_${patent.kind}`)+' / '+L(`patent_weigth_${patent.weight}`)}</RB.Col>
      </RB.Row>
      <RB.Row>
        <RB.Col>{L('item_desc_owner')}</RB.Col>
        <RB.Col>{owners}</RB.Col>
      </RB.Row>
      <RB.Row>
        <RB.Col>{L('item_desc_data')}</RB.Col>
        <RB.Col>{patent.data}</RB.Col>
      </RB.Row>
    </RB.Container></RB.Col><RB.Col><RB.Container>
      <RB.Row>
        <RB.Col>{L('res_desc_kind')}</RB.Col>
        <RB.Col>{L('res_required')}</RB.Col>
        <RB.Col>{L('res_filled')}</RB.Col>
      </RB.Row>
      {costs}
    </RB.Container></RB.Col></RB.Row></RB.Container>
}
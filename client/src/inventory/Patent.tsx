import React from 'react'
import * as RB from 'react-bootstrap'
import {Patent, InstitutionType} from '../common/entity'
import {MarketType, Owner} from '../common/entity'
import {IDField} from '../util/components'
import {ItemOwnerCol, ItemPriceInput} from './Item/components'
import {PopupButton} from '../util/buttons'
import {default as L, LR} from './locale'

type RowDescProps = {
    className?: string
}
export function PatentRowDesc(props: RowDescProps){
    return <RB.Row className={props.className}>
      <RB.Col>{LR('item_desc_id')}</RB.Col>
      <RB.Col>{LR('item_desc_name')}</RB.Col>
      <RB.Col>{LR('patent_desc_weight')}</RB.Col>
      <RB.Col>{LR('patent_desc_kind')}</RB.Col>
      <RB.Col>{LR('patent_desc_ownership')}</RB.Col>
      <RB.Col>{LR('item_desc_actions')}</RB.Col>
    </RB.Row>
}

const OwnerListPopover = (patent: Patent)=>{
    return <RB.Popover id={`popover_corps_${patent._id}`}>
      <RB.PopoverBody>
        <ItemOwnerCol item={patent} layout={null} />
      </RB.PopoverBody>
    </RB.Popover>
}

type RowProps = {
    owner: Owner
    patent: Patent
    onAction?: (action: string, patent: Patent)=>()=>Promise<boolean>
    onSell?: (item: Patent, target: Owner, price: number)=>Promise<boolean>
} & RowDescProps
export function PatentRow(props: RowProps){
    const {patent, owner} = props
    const len = patent.owners.length
    const owners = patent.owners.reduce((p, f)=>p + +(f._id==owner._id), 0)
    const ownership = patent.owners.length<2 ? LR('patent_ownership_full') :
        LR(`patent_ownership_shared`)+` [${owners}/${len}]`
    const is_served = Patent.served(patent, owner)
    const cls = props.className+(is_served ? ' patent-served' : '')
    return <RB.Row key={`patent_${patent._id}`} className={cls}>
        <RB.Col><IDField item={patent} /></RB.Col>
        <RB.Col>{patent.name}</RB.Col>
        <RB.Col>{LR(`patent_weigth_${patent.weight}`)}</RB.Col>
        <RB.Col>{LR(`patent_kind_${patent.kind}`)}</RB.Col>
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

function PatentSellButton(props: RowProps){
  const {owner: owner, patent, onSell} = props
  if (patent.market?.type!=MarketType.Sale)
      return <ItemPriceInput item={patent} noRange={true} onSell={onSell} source={owner} />
  return <PopupButton url={`/item/${patent._id}/code`} desc={L('act_show_code')} />
}

function PatentActions(props: RowProps){
    const {patent, owner, onAction} = props
    if (owner.type==InstitutionType.Research)
        return <RB.Button>{L('act_pay')}</RB.Button>
    const is_served = Patent.served(patent, owner)
    return <RB.Container>
      {!is_served && patent.ready  && <RB.Row><RB.Col>
        <RB.Button onClick={onAction('forward', patent)}>
          {L('act_forward_center')}</RB.Button>
      </RB.Col></RB.Row>}
      <RB.Row>
        {!is_served && <RB.Col>
          <PatentSellButton {...props} />
        </RB.Col>}
        {patent.ready && <RB.Col>
          <RB.Button onClick={onAction('product', patent)}>
            {L('act_product')}</RB.Button>
        </RB.Col>}
      </RB.Row>
    </RB.Container>
}

export function PatentLabItem(props: RowProps){
    const {patent} = props
    const rowClass = r=>(r.provided|0)>=r.value ? 'resource-full' : ''
    const costs = patent.resourceCost.map(r=><RB.Row className={rowClass(r)}>
      <RB.Col>{LR(`res_kind_${r.kind}`)}</RB.Col>
      <RB.Col>{r.value}</RB.Col>
      <RB.Col>{r.provided|0}</RB.Col>
    </RB.Row>)
    const cls = patent.ready ? 'patent-ready' : ''
    return <RB.Container className={`menu-list-box ${cls}`}><RB.Row><RB.Col><RB.Container>
      <RB.Row><IDField item={patent} /></RB.Row>
      <RB.Row>
        <RB.Col>{LR('item_desc_name')}</RB.Col>
        <RB.Col>{patent.name}</RB.Col>
      </RB.Row>
      <RB.Row>
        <RB.Col>{LR('patent_desc_kind')+' / '+LR('patent_desc_weight')}</RB.Col>
        <RB.Col>{LR(`patent_kind_${patent.kind}`)+' / '+LR(`patent_weigth_${patent.weight}`)}</RB.Col>
      </RB.Row>
      <RB.Row>
        <RB.Col>{LR('item_desc_owner')}</RB.Col>
        <ItemOwnerCol item={patent} layout={null} />
      </RB.Row>
      <RB.Row>
        <RB.Col>{LR('item_desc_data')}</RB.Col>
        <RB.Col>{patent.data}</RB.Col>
      </RB.Row>
    </RB.Container></RB.Col><RB.Col><RB.Container>
      <RB.Row>
        <RB.Col>{LR('res_desc_kind')}</RB.Col>
        <RB.Col>{L('amount_required')}</RB.Col>
        <RB.Col>{L('amount_filled')}</RB.Col>
      </RB.Row>
      {costs}
    </RB.Container></RB.Col></RB.Row></RB.Container>
}
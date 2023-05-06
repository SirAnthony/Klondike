import React from 'react'
import * as RB from 'react-bootstrap'
import {Owner, Order, ResourceCost, User, InstitutionType, LogEntry, LogAction} from '../common/entity'
import {OwnerSelect, NumberInput, MultiResourceCostSelect, RandomID, ResourceCostID} from '../util/inputs'
import {default as L} from './locale'
import {ClientError} from '../common/errors'
import {ErrorMessage} from '../util/errors'
import * as _ from 'lodash'
import {DataViewerButtons, EditButtons} from '../util/buttons'
import * as date from '../common/date'

type RowDescProps = {
    className?: string
}
export function LogRowDesc(props: RowDescProps){
    return <RB.Row className={props.className}>
      <RB.Col>{L('log_ts')}</RB.Col>
      <RB.Col sm={1}>{L('log_cycle')}</RB.Col>
      <RB.Col>{L('log_action')}</RB.Col>
      <RB.Col sm={1}>{L('log_points')}</RB.Col>
      <RB.Col>{L('log_owner')}</RB.Col>
      <RB.Col>{L('log_info')}</RB.Col>
      <RB.Col>{L('log_item')}</RB.Col>
      <RB.Col>{L('log_insitution')}</RB.Col>
      <RB.Col>{L('log_order')}</RB.Col>
      <RB.Col>{L('log_flight')}</RB.Col>
      <RB.Col>{L('log_data')}</RB.Col>
      <RB.Col>{L('actions')}</RB.Col>
    </RB.Row>
}

type RowProps = {
    entry: LogEntry
    user?: User
    onReload?: ()=>void
    onSubmit?: (o: LogEntry)=>Promise<boolean>
    onDelete?: (o: LogEntry)=>void
} & RowDescProps
export function LogRow(props: RowProps){
    const [showEdit, setShowEdit] = React.useState(false)
    const {entry} = props
    const is_admin = props.user.admin
    if (is_admin && showEdit){
        return null
        //return <LogRowNew {...props} onSubmit={async obj=>{
        //  (await props.onSubmit(obj)) && setShowEdit(false)
        //}} onCancel={()=>setShowEdit(false)} />
    }
    const onDelete = is_admin ? ()=>props.onDelete(entry) : null
    return <RB.Row key={`log_${entry._id}`} className={props.className}>
        <RB.Col>{date.longdate(entry.ts)}</RB.Col>
        <RB.Col sm={1}>{entry.cycle}</RB.Col>
        <RB.Col>{LogAction[entry.action]}</RB.Col>
        <RB.Col sm={1}>{entry.points}</RB.Col>
        <RB.Col>{entry.owner?.name}</RB.Col>
        <RB.Col>{entry.info}</RB.Col>
        <RB.Col>{JSON.stringify(entry.item)}</RB.Col>
        <RB.Col>{entry.institution?.name}</RB.Col>
        <RB.Col>{JSON.stringify(entry.order)}</RB.Col>
        <RB.Col>{JSON.stringify(entry.flight)}</RB.Col>
        <RB.Col>{JSON.stringify(entry.data)}</RB.Col>
        <RB.Col>
          {is_admin && <DataViewerButtons onEdit={setShowEdit} onDelete={onDelete} />}
        </RB.Col>
    </RB.Row>
}

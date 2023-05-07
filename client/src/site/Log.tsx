import React from 'react'
import * as RB from 'react-bootstrap'
import {Owner, Order, ResourceCost, User, InstitutionType, LogEntry, LogAction, Flight} from '../common/entity'
import {OwnerSelect, NumberInput, MultiResourceCostSelect, RandomID, ResourceCostID, LogActionSelect, TextInput, OrderSelect} from '../util/inputs'
import {default as L, LR} from './locale'
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
      <RB.Col>{LR('desc_time')}</RB.Col>
      <RB.Col sm={1}>{L('log_cycle')}</RB.Col>
      <RB.Col>{L('log_action')}</RB.Col>
      <RB.Col sm={1}>{L('log_points')}</RB.Col>
      <RB.Col>{L('log_owner')}</RB.Col>
      <RB.Col>{L('log_desc_info')}</RB.Col>
      <RB.Col>{L('log_item')}</RB.Col>
      <RB.Col>{L('log_insitution')}</RB.Col>
      <RB.Col>{L('log_order')}</RB.Col>
      <RB.Col>{L('log_flight')}</RB.Col>
      <RB.Col>{L('log_data')}</RB.Col>
      <RB.Col>{LR('actions')}</RB.Col>
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
        return <LogRowNew {...props} onSubmit={async obj=>{
          (await props.onSubmit(obj)) && setShowEdit(false)
        }} onCancel={()=>setShowEdit(false)} />
    }
    const onDelete = is_admin ? ()=>props.onDelete(entry) : null
    return <RB.Row key={`log_${entry._id}`} className={props.className}>
        <RB.Col>{date.interval(entry.ts)}</RB.Col>
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

type RowNewProps = {
    entry?: LogEntry
    add?: boolean
    onSubmit: (entry: LogEntry)=>void
    onCancel?: ()=>void
} & RowDescProps
type RowNewState = {
    action: LogAction
    name: string
    owner?: Owner
    info?: string
    institution?: Owner
    order?: Order
    flight?: Flight
    ts?: number
    points?: number
    data?: any
    cycle?: number
    err?: ClientError
}
export class LogRowNew extends React.Component<RowNewProps, RowNewState> {
    constructor(props){
        super(props)
        this.state = {...props.order};
        ['onCreate'].forEach(r=>this[r] = this[r].bind(this))
    }
    stateChange(obj: any){
        this.setState(Object.assign({err: null}, obj)) }
    onCreate(){
        const {action, name, owner, info, institution, order, flight, ts,
            points, data, cycle} = this.state
        if (!owner || isNaN(+cycle) || isNaN(+action))
            return this.setState({err: new ClientError('Wrong owner or cycle or action')})
        this.props.onSubmit({_id: this.props.entry?._id, action, owner, info,
            institution, order, flight, ts, points, data, cycle, name})
    }
    render(){
        const {state} = this
        const exclude = []
        return <RB.Row className='menu-list-row'><RB.Col><RB.InputGroup>
          <RB.Row className='menu-input-row'>
            {state.err && <RB.Row><ErrorMessage field={state.err} /></RB.Row>}
            <RB.Col>{L('act_log_create')}</RB.Col>
            <RB.Col>
              <LogActionSelect value={state.action}
                onChange={action=>this.stateChange({action})} />
            </RB.Col>
            <RB.Col>
              <OwnerSelect value={state.owner} exclude={exclude}
                onChange={owner=>this.stateChange({owner})} />
            </RB.Col>
            <RB.Col>
              <TextInput value={state.info} placeholder={LR('log_desc_info')}
                onChange={info=>this.stateChange({info})} />
            </RB.Col>
            <RB.Col>
              <NumberInput placeholder={''} value={state.cycle}
                onChange={cycle=>this.stateChange({cycle})} />
            </RB.Col>
          </RB.Row>
          <RB.Row>
            <RB.Col>
              <OwnerSelect value={state.institution} title={'institution'}
                onChange={institution=>this.stateChange({institution})} />
            </RB.Col>
            <RB.Col>{'order select'}
              {/*<OrderSelect value={state.order} owner
                onChange={order=>this.stateChange({order})} />
               */}
            </RB.Col>
            <RB.Col>{'flight select'}</RB.Col>
          </RB.Row><RB.Row>
            <RB.Col>
              <NumberInput placeholder={'points'} value={state.points}
                onChange={points=>this.stateChange({points})} />
            </RB.Col>
            <RB.Col>
              <NumberInput placeholder={'desc_cycle'} value={state.cycle}
                onChange={cycle=>this.stateChange({cycle})} />
            </RB.Col>
            <RB.Col>
              <EditButtons add={this.props.add} disabled={!!state.err}
                onSubmit={this.onCreate} onCancel={this.props.onCancel} />
            </RB.Col>
          </RB.Row>
        </RB.InputGroup>
        </RB.Col></RB.Row>
    }
}

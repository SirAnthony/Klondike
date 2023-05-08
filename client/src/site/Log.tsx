import React from 'react'
import * as RB from 'react-bootstrap'
import {Owner, Order, ResourceCost, User, InstitutionType, LogEntry, LogAction, Flight, EventGroupType, EventGroups, Item} from '../common/entity'
import {OwnerSelect, NumberInput, MultiResourceCostSelect, RandomID, ResourceCostID, LogActionSelect, TextInput, OrderSelect} from '../util/inputs'
import {default as L, LR} from './locale'
import {ClientError} from '../common/errors'
import {ErrorMessage} from '../util/errors'
import * as _ from 'lodash'
import {DataViewerButtons, EditButtons} from '../util/buttons'
import * as date from '../common/date'
import { ItemPopoverOverlay } from '../inventory/Item/Popover'
import { ResourceCostCol } from 'src/inventory/Item/components'
import { FlightLocationCol, FlightShipCol, FlightStatusCol, FlightTypeCol } from '../ship/Flights'


type RowDescProps = {
    className?: string
    groups?: EventGroupType[]
}
export function LogRowDesc(props: RowDescProps){
    const hasGroup = (g: EventGroupType)=>
        !props?.groups?.length || props?.groups?.includes(+g)
    return <RB.Row className={props.className}>
      <RB.Col>{LR('desc_time')}</RB.Col>
      <RB.Col sm={1}>{LR('cycle')}</RB.Col>
      <RB.Col>{LR('item_desc_type')}</RB.Col>
      {hasGroup(EventGroupType.Order) && <RB.Col sm={1}>{LR('desc_points')}</RB.Col>}
      <RB.Col>{LR('item_desc_owner')}</RB.Col>
      <RB.Col>{LR('desc_info')}</RB.Col>
      <RB.Col>{LR('item_desc')}</RB.Col>
      <RB.Col>{LR('item_desc_target')}</RB.Col>
      {hasGroup(EventGroupType.Order) && <RB.Col>{LR('desc_order')}</RB.Col>}
      {hasGroup(EventGroupType.Flight) && <RB.Col>{LR('desc_flight')}</RB.Col>}
      <RB.Col>{LR('item_desc_actions')}</RB.Col>
    </RB.Row>
}

function OrderCol(props: {item: Order}){
    const {item} = props
    if (!item)
        return <RB.Col></RB.Col>
    return <ResourceCostCol item={item as unknown as Item} layout={null}/>
}

function FlightCol(props: {flight: Flight, user: User, key: string}){
    const {flight, key} = props
    if (!flight)
        return <RB.Col></RB.Col>
    return <RB.Col key={key}>
      <FlightShipCol {...props} />
      <FlightTypeCol {...props} />
      <FlightLocationCol {...props} />
      <FlightStatusCol {...props} />
    </RB.Col>
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
    const {entry, user} = props
    const is_admin = props.user.admin
    if (is_admin && showEdit){
        return <LogRowNew {...props} onSubmit={async obj=>{
          (await props.onSubmit(obj)) && setShowEdit(false)
        }} onCancel={()=>setShowEdit(false)} />
    }
    function inEventGroup(){
        return !props?.groups?.length || props?.groups?.some(group=>EventGroups[group].includes(+entry.action)) }
    const onDelete = is_admin ? ()=>props.onDelete(entry) : null
    const key = `log_${entry._id}`
    return <RB.Row key={key} className={props.className}>
        <RB.Col sm={1} key={`${key}_date`}>{date.interval(entry.ts)}</RB.Col>
        <RB.Col sm={1} key={`${key}_cycle`}>{entry.cycle}</RB.Col>
        <RB.Col key={`${key}_action`}>{LogAction[entry.action]}</RB.Col>
        {inEventGroup() && <RB.Col sm={1} key={`${key}_points`}>{entry.points}</RB.Col>}
        <RB.Col key={`${key}_owner`}>{entry.owner?.name}</RB.Col>
        <RB.Col key={`${key}_info`}>{entry.info}</RB.Col>
        <RB.Col key={`${key}_item`}>
          <ItemPopoverOverlay item={entry.item} show={true} target={null}>
            <span>{entry.item?.name}</span>
          </ItemPopoverOverlay>
        </RB.Col>
        <RB.Col key={`${key}_institution`}>{entry.institution?.name}</RB.Col>
        {inEventGroup() && <OrderCol key={`${key}_order`} item={entry.order}/>}
        {inEventGroup() && <FlightCol key={`${key}_flight`} flight={entry.flight} user={user} />}
        <RB.Col key={`${key}_actions`}>
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
            <RB.Col sm={2}>
              <LogActionSelect value={state.action}
                optonValue={v=>LogAction[v as unknown as string]}
                onChange={action=>this.stateChange({action})} />
            </RB.Col>
            <RB.Col>
              <OwnerSelect value={state.owner} exclude={exclude}
                onChange={owner=>this.stateChange({owner})} />
            </RB.Col>
            <RB.Col sm={1}>
              <NumberInput placeholder={LR('cycle')} value={state.cycle}
                onChange={cycle=>this.stateChange({cycle})} />
            </RB.Col>
            <RB.Col sm={1}>
              <NumberInput placeholder={LR('desc_points')} value={state.points}
                onChange={points=>this.stateChange({points})} />
            </RB.Col>
            <RB.Col>
              <EditButtons add={this.props.add} disabled={!!state.err}
                onSubmit={this.onCreate} onCancel={this.props.onCancel} />
            </RB.Col>
          </RB.Row>
          <RB.Row>
            <RB.Col>
              <OwnerSelect value={state.institution} title={LR('item_desc_target')}
                onChange={institution=>this.stateChange({institution})} />
            </RB.Col>
            {/*<RB.Col>{'order select'}
              <OrderSelect value={state.order} owner
                onChange={order=>this.stateChange({order})} />
            </RB.Col>
            <RB.Col>{'flight select'}</RB.Col> */}
            <RB.Col>
              <TextInput value={state.info} placeholder={LR('desc_info')}
                onChange={info=>this.stateChange({info})} />
            </RB.Col>
          </RB.Row>
        </RB.InputGroup>
        </RB.Col></RB.Row>
    }
}

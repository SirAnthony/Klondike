import React from 'react';
import * as RB from 'react-bootstrap'
import {Item, Flight, User, UserType, FlightStatus} from '../common/entity'
import {List as UList} from '../util/controls'
import {LocationCol} from '../inventory/Item/components';
import {ErrorMessage} from '../util/errors';
import * as util from '../common/util'
import * as date from '../common/date'
import {default as L, LR} from './locale'

export type FlightRowParams = {
    flight: Flight
    user: User
    editRow?: (params: FlightRowParams)=>React.ReactElement
    actionsClass?: (params: FlightRowParams)=>React.ReactElement
    onAction?: (action: string, flight: Flight)=>void
    onSubmit?: (f: Flight)=>Promise<boolean>
    onDelete?: ()=>void
    onEdit?: ()=>void 
    onCancel?: ()=>void
}

function FlightRowShip(params: FlightRowParams){
    const {flight} = params
    if (flight.owner)
        return <RB.NavLink href={`/ship/${flight.owner._id}`}>{flight.owner.name}</RB.NavLink>
    return 
}

function FlightLocationCol(params: FlightRowParams){
    const {flight, user} = params
    if (!flight.owner)
        return <RB.Col>-</RB.Col>
    if (user.kind==UserType.Captain)
        return <RB.Col>{L('desc_info_hidden')}</RB.Col>
    return <LocationCol item={(flight as unknown) as Item} layout={null} />
}

function FlightActions(params: FlightRowParams){
    const {flight, user, onAction} = params
    const sp = s=>s.split(' ')
    const actions = {
        [UserType.Captain]: sp('delist signup'),
        [UserType.Guard]: sp('block help'),
        [UserType.Master]: sp('block delist departure arrival unblock'),
    }
    const statuses = {
       [FlightStatus.Docked]: sp('block signup'),
       [FlightStatus.Waiting]: sp('block delist departure'),
       [FlightStatus.InFlight]: sp('arrival'),
       [FlightStatus.SOS]: sp('arrival help'),
       [FlightStatus.Blocked]: sp('unblock'),
    }
    const btns = statuses[flight.status|0]
        .filter(s=>flight.owner || s==='signup')
        .filter(s=>actions[user.kind].includes(s))
        .map(t=><RB.Button onClick={()=>onAction(t, flight)}>
            {L(`act_flight_${t}`)}</RB.Button>)
    return <RB.Col>
      {btns}
    </RB.Col>
}

export function FlightRow(props: FlightRowParams) {
    const {flight} = props
    const [edit, setEdit] = React.useState(false)
    if (edit && props.editRow)
        return <props.editRow {...props} onCancel={()=>setEdit(false)} />
    return <RB.Row className="menu-list-row">
      <RB.Col>{date.timeday(flight.ts, {month: 'numeric'})}</RB.Col>
      <RB.Col><FlightRowShip {...props} /></RB.Col>
      <RB.Col>{flight.owner ? LR(`flight_type_${flight.type}`) : ' '}</RB.Col>
      <FlightLocationCol {...props} />
      <RB.Col>{flight.owner ? LR(`flight_status_${flight.status}`) : ' '}</RB.Col>
      <props.actionsClass {...props} onEdit={()=>setEdit(true)} />
    </RB.Row>
}

export class BaseList<P, S> extends UList<FlightListProps & P, FlightListState & S> {
    L = L
    get fetchUrl() { return `/api/ship/flights` }
    get rowNew(){ return <></> }
    getRow(flight: Flight){ return <></> }
    body(){
        const {list, err} = this.state
        const rows = list.map(l=>this.getRow(l))
        return [err && <RB.Row><ErrorMessage field={err} /></RB.Row>,
        this.rowNew,
        <RB.Row key={'ship_list_title'} className="menu-list-title">
          <RB.Col>{LR('desc_time')}</RB.Col>
          <RB.Col>{LR('desc_ship')}</RB.Col>
          <RB.Col>{LR('flight_desc_type')}</RB.Col>
          <RB.Col>{LR('item_desc_target')}</RB.Col>
          <RB.Col>{LR('flight_desc_status')}</RB.Col>
          <RB.Col></RB.Col>
        </RB.Row>, ...rows]
    }
}

export function ListNavigator(props: {user: User}){
    const {user} = props
    return <List user={user} />
}

type FlightListState = {
    list?: Flight[]
}
type FlightListProps = {
    user: User
}
export class List extends BaseList<FlightListProps, FlightListState> {
    L = L
    async onAction(name: string, flight: Flight){
        this.setState({err: null})
        const ret = await util.wget(`/api/ship/flight/${flight._id}/action/${name}`,
            {method: 'PUT'})
        if (ret.err)
            this.setState({err: ret.err})
        this.fetch()
    }
    getRow(flight: Flight){
        return <FlightRow key={`flight_list_${flight._id}`} flight={flight}
          onAction={(s, f)=>this.onAction(s, f)} user={this.props.user}
          actionsClass={FlightActions} />
    }
}
import React from 'react';
import * as RB from 'react-bootstrap'
import {Item, Flight, User, UserType, FlightStatus} from '../common/entity'
import {List as UList} from '../util/controls'
import {LocationCol} from '../inventory/Item/components';
import {ErrorMessage} from '../util/errors';
import * as util from '../common/util'
import {default as L, LR} from './locale'

type FlightRowParams = {
    flight: Flight
    user: User
    onAction: (action: string, flight: Flight)=>void
}

function FlightRowShip(params: FlightRowParams){
    const {flight} = params
    if (flight.ship)
        return <RB.NavLink href={`/ship/${flight.ship._id}`}>{flight.ship.name}</RB.NavLink>
    return 
}

function FlightLocationCol(params: FlightRowParams){
    const {flight, user} = params
    if (!flight.ship)
        return <RB.Col>-</RB.Col>
    if (user.kind==UserType.Captain)
        return <RB.Col>{L('desc_info_hidden')}</RB.Col>
    return <LocationCol item={(flight as unknown) as Item} layout={null} />
}

function FlightActions(params: FlightRowParams){
    const {flight, user, onAction} = params
    if (!flight.ship)
        return <RB.Col><span></span></RB.Col>
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
    const btns = statuses[flight.status].filter(s=>actions[user.kind].includes(s))
        .map(t=><RB.Button onClick={()=>onAction(t, flight)}>
            {L(`act_flight_${t}`)}</RB.Button>)
    return <RB.Col>
      {btns}
    </RB.Col>
}

function FlightRow(params: FlightRowParams) {
    const {flight} = params
    return <RB.Row className="menu-list-row">
      <RB.Col>{flight.ts}</RB.Col>
      <RB.Col><FlightRowShip {...params} /></RB.Col>
      <RB.Col>{flight.ship ? LR(`desc_flight_type_${flight.type}`) : ' '}</RB.Col>
      <FlightLocationCol {...params} />
      <RB.Col>{flight.ship ? L(`desc_flight_status_${flight.status}`) : ' '}</RB.Col>
      <FlightActions {...params} />
    </RB.Row>
}

type FlightListState = {
    list?: Flight[]
}
type FlightListProps = {
    user: User
}
export default class List extends UList<FlightListProps, FlightListState> {
    L = L
    get fetchUrl() { return `/api/ship/flights` }
    constructor(props){
        super(props);
        ['Action'].forEach(k=>this[`on${k}`] = this[`on${k}`].bind(this))
    }
    async onAction(name: string, flight: Flight){
        this.setState({err: null})
        const ret = await util.wget(`/api/ship/flight/${name}`, {method: 'PUT'})
        if (ret.err)
            this.setState({err: ret.err})
        this.fetch()
    }
    body(){
        const {list, err} = this.state
        const rows = list.map(l=><FlightRow key={`flight_list_${l._id}`} flight={l} 
            user={this.props.user} onAction={this.onAction} />)
        return [err && <RB.Row><ErrorMessage field={err} /></RB.Row>,
        <RB.Row key={'ship_list_title'} className="menu-list-title">
          <RB.Col></RB.Col>
          <RB.Col>{L('desc_time')}</RB.Col>
          <RB.Col>{L('desc_ship')}</RB.Col>
          <RB.Col>{L('desc_flight_type')}</RB.Col>
          <RB.Col>{L('desc_flight_location')}</RB.Col>
          <RB.Col>{L('desc_flight_status')}</RB.Col>
          <RB.Col></RB.Col>
        </RB.Row>, ...rows]
    }
}
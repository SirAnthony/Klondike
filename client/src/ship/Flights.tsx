import React from 'react';
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import Ship from './Ship'
import {Item, Flight, User, UserType, FlightStatus} from '../common/entity'
import {List as UList} from '../util/controls'
import {ControlBar} from '../util/controls'
import {default as L, LR} from './locale'
import { LocationCol } from 'src/inventory/Item/components';

type FlightRowParams = {
    flight: Flight
    user: User
    //onAction: (flight: Flight)=>void
    onSignup: (flight: Flight)=>void
    onDelist: (flight: Flight)=>void
    onBlock: (flight: Flight)=>void
    onUnblock: (flight: Flight)=>void
    onHelp: (flight: Flight)=>void
    onDeparture: (flight: Flight)=>void
    onArrival: (flight: Flight)=>void
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
    const {flight, user} = params
    if (!flight.ship)
        return <span></span>
    const col = a=><RB.Col>{a}</RB.Col>
    const btn = (c, t)=><RB.Button onClick={()=>c()}>{t}</RB.Button>
    switch (flight.status){
    case FlightStatus.Docked:
    {
        if (user.kind==UserType.Captain)
            return col(btn(params.onSignup, L('act_flight_signup')))
        if ([UserType.Guard, UserType.Master])
            return col(btn(params.onBlock, L('act_flight_block')))
        break
    }
    case FlightStatus.Waiting:
    {
        if (user.kind==UserType.Captain)
            return col(btn(params.onDelist, L('act_flight_delist')))
        if (user.kind==UserType.Guard)
            return col(btn(params.onBlock, L('act_flight_block')))
        if (user.kind==UserType.Master){
            return <RB.Col>
                {btn(params.onBlock, L('act_flight_block'))}
                {btn(params.onDelist, L('act_flight_delist'))}
                {btn(params.onDeparture, L('act_flight_departure'))}
            </RB.Col>
        }
        break
    }
    case FlightStatus.InFlight:
    {
        if (user.kind==UserType.Master)
            return col(btn(params.onArrival, L('act_flight_arrival')))
        break
    }
    case FlightStatus.SOS:
    {
        if (user.kind==UserType.Guard)
            return col(btn(params.onHelp, L('act_flight_help')))
        if (user.kind==UserType.Master)
            return col(btn(params.onArrival, L('act_flight_arrival')))
        break
    }
    case FlightStatus.Blocked:
    {
        if ([UserType.Guard, UserType.Master])
            return col(btn(params.onUnblock, L('act_flight_unblock')))
        break
    }}
    return col(<span></span>)
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
        ['Signup', 'Delist', 'Block', 'Unblock', 'Help', 'Arrival',
         'Departure'].forEach(k=>this[`on${k}`] = this[`on${k}`].bind(this))
    }
    async onSignup(flight: Flight){

    }
    async onDelist(flight: Flight){

    }
    async onBlock(flight: Flight){

    }
    async onUnblock(flight: Flight){

    }
    async onHelp(flight: Flight){

    }
    async onArrival(flight: Flight){

    }
    async onDeparture(flight: Flight){

    }
    body(){
        const {list} = this.state
        const rows = list.map(l=><FlightRow key={`flight_list_${l._id}`} flight={l} 
            user={this.props.user} onSignup={this.onSignup} onDelist={this.onDelist}
            onBlock={this.onBlock} onUnblock={this.onUnblock} onHelp={this.onHelp}
            onArrival={this.onArrival} onDeparture={this.onDeparture}/>)
        return [<RB.Row key={'ship_list_title'} className="menu-list-title">
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
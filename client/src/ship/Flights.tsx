import React from 'react';
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import Ship from './Ship'
import {Item, Flight, User, UserType} from '../common/entity'
import {List as UList} from '../util/controls'
import {ControlBar} from '../util/controls'
import {default as L, LR} from './locale'
import { LocationCol } from 'src/inventory/Item/components';

type FlightRowParams = {
    flight: Flight
    user: User
    onSignup: (flight: Flight)=>void
}

function FlightRowShip(params: FlightRowParams){
    const {flight} = params
    if (flight.ship)
        return <RB.NavLink href={`/ship/${flight.ship._id}`}>{flight.ship.name}</RB.NavLink>
    return <RB.Button onClick={()=>params.onSignup}>{L('act_flight_signup')}</RB.Button>
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
    return <span></span>
}

function FlightRow(params: FlightRowParams) {
    const {flight} = params
    return <RB.Row className="menu-list-row">
      <RB.Col>{flight.ts}</RB.Col>
      <RB.Col><FlightRowShip {...params} /></RB.Col>
      <RB.Col>{flight.ship ? LR(`desc_flight_type_${flight.type}`) : ' '}</RB.Col>
      <FlightLocationCol {...params} />
      <RB.Col>{flight.ship ? L(`desc_flight_status_${flight.status}`) : ' '}</RB.Col>
      <RB.Col><FlightActions {...params} /></RB.Col>
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
        ['Signup'].forEach(k=>
            this[`on${k}`] = this[`on${k}`].bind(this))
    }
    async onSignup(){

    }
    body(){
        const {list} = this.state
        const rows = list.map(l=><FlightRow key={`flight_list_${l._id}`} flight={l} 
            user={this.props.user} onSignup={this.onSignup}/>)
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
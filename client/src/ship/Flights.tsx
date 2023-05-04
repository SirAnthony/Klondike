import React from 'react';
import * as RB from 'react-bootstrap'
import {
    Item, Flight, User, UserType, FlightStatus, Location,
    UserTypeIn, OwnerMatch, FlightType, Planet, InstitutionType,
    Pos,
} from '../common/entity'
import {List as UList} from '../util/controls'
import {LocationCol} from '../inventory/Item/components';
import {default as L, LR} from './locale'
import { TimeInput } from 'src/util/inputs';
import {Select as PSelect} from '../map/List'
import { PlanetView } from '../map/Planet';
import * as util from '../common/util'
import * as date from '../common/date'

export type FlightRowProps = {
    flight: Flight
    user: User
    editRow?: (params: FlightRowProps)=>React.ReactElement
    actionsClass?: (params: FlightRowProps)=>React.ReactElement
    onAction?: (action: string, flight: Flight)=>void
    onSubmit?: (f: Flight)=>Promise<boolean>
    onDelete?: ()=>void
    onEdit?: ()=>void 
    onCancel?: ()=>void
}

function FlightRowShip(params: FlightRowProps){
    const {flight} = params
    if (flight.owner)
        return <RB.NavLink href={`/ship/${flight.owner._id}`}>{flight.owner.name}</RB.NavLink>
    return 
}

function FlightLocationCol(params: FlightRowProps){
    const {flight, user} = params
    if (!flight.owner)
        return <RB.Col>-</RB.Col>
    const allowed = OwnerMatch(flight.owner, user.relation) ||
        UserTypeIn(user, UserType.Guard | UserType.Master)
    if (!allowed)
        return <RB.Col>{L('desc_info_hidden')}</RB.Col>
    return <LocationCol item={(flight as unknown) as Item} layout={null} />
}

function FlightActions(params: FlightRowProps){
    const {flight, user, onAction} = params
    if (flight.owner && flight.arrival)
        return <RB.Col></RB.Col>
    const sp = s=>s.split(' ')
    const owner = UserTypeIn(user, UserType.Master | UserType.Guard) ||
        OwnerMatch(user.relation, flight.owner)
    const actions = {
        [UserType.Captain]: sp('delist signup'),
        [UserType.Guard]: sp('block help unblock'),
        [UserType.Master]: sp('block delist departure arrival unblock'),
    }
    const statuses = {
       [FlightStatus.Docked]: sp('block signup'),
       [FlightStatus.Waiting]: sp('block delist departure'),
       [FlightStatus.InFlight]: sp('arrival'),
       [FlightStatus.SOS]: sp('arrival help'),
       [FlightStatus.Blocked]: sp('unblock'),
    }
    const user_actions = [...new Set(Object.keys(actions)
        .filter(k=>UserTypeIn(user, +k)).map(a=>actions[a]).flat())]
    const btns = statuses[flight.status|0]
        .filter(s=>flight.owner ? owner : s==='signup')
        .filter(s=>user_actions.includes(s))
        .map(t=><RB.Button onClick={()=>onAction(t, flight)}>
            {L(`act_flight_${t}`)}</RB.Button>)
    return <RB.Col>
      {btns}
    </RB.Col>
}

function FlightTypeCol(props: FlightRowProps){
    const {flight, user} = props
    const master = UserTypeIn(user, UserType.Master)
    const allowed = master || flight.owner && 
        (UserTypeIn(user, UserType.Guard) || OwnerMatch(flight.owner, user.relation))
    const type = allowed ? LR(`flight_type_${flight.type}`) :
        flight.owner ? L('desc_info_hidden') : ' '
    return <RB.Col>{type}</RB.Col>
}

function FlightStatusCol(props: FlightRowProps){
    const {flight, user} = props
    const allowed = OwnerMatch(flight.owner, user.relation) ||
        UserTypeIn(user, UserType.Guard | UserType.Master)
    const status = !flight.owner ? ' ' :
        !allowed ? L('desc_info_hidden') : [
        !flight.arrival && LR(`flight_status_${flight.status}`),
        flight.arrival ? L('desc_arrived') + ' ' + date.timeday(flight.arrival) : null,
        !flight.arrival && flight.departure && date.timeday(flight.departure)
    ].filter(Boolean).join(' ')
    return <RB.Col>{status}</RB.Col>
}

export function FlightRow(props: FlightRowProps) {
    const {flight} = props
    const [edit, setEdit] = React.useState(false)
    if (edit && props.editRow)
        return <props.editRow {...props} onCancel={()=>setEdit(false)} />
    return <RB.Row className="menu-list-row">
      <RB.Col>{date.timeday(flight.ts, {month: 'numeric'})}</RB.Col>
      <RB.Col><FlightRowShip {...props} /></RB.Col>
      <FlightTypeCol {...props} />
      <FlightLocationCol {...props} />
      <FlightStatusCol {...props} />
      <props.actionsClass {...props} onEdit={()=>setEdit(true)} />
    </RB.Row>
}

export class BaseList<P, S> extends UList<FlightListProps & P, FlightListState & S> {
    L = L
    get fetchUrl() { return `/api/ship/flights` }
    get rowNew(){ return null }
    get mapView(){ return null }
    getRow(flight: Flight){ return <></> }
    body(){
        const {list, err} = this.state
        const rows = list.map(l=>this.getRow(l))
        const map = this.mapView
        return [!map && this.rowNew,
        <RB.Row key={'ship_list_title'} className="menu-list-title">
          <RB.Col>{LR('desc_time')}</RB.Col>
          <RB.Col>{LR('desc_ship')}</RB.Col>
          <RB.Col>{LR('flight_desc_type')}</RB.Col>
          <RB.Col>{LR('item_desc_target')}</RB.Col>
          <RB.Col>{LR('flight_desc_status')}</RB.Col>
          <RB.Col></RB.Col>
        </RB.Row>, ...rows, map && this.rowNew, map]
    }
}

type FlightSend = Omit<Flight, 'name' | 'keys' | 'class' | 'status'>
type FlightRowNewParams = {
    flight: FlightSend
    onSubmit: (f: FlightSend)=>Promise<boolean>
    onLocChanged: (f: Location)=>void
} & Omit<FlightRowProps, 'actionsClass' | 'flight'>
function FlightRowNew(props: FlightRowNewParams){
    const {flight, user} = props
    const owner = user.relation
    const [ts, setTime] = React.useState(flight?.ts || date.add(undefined, {min: 10}))
    const [location, setLocation] = React.useState(flight?.location)
    const check = ()=>ts && (location?._id && !isNaN(+location.pos.col) &&
        !isNaN(location?.pos?.row)) && flight?.points?.length
    const onSubmit = async ()=>check() && (await props.onSubmit({
        type: FlightType.Drone, ts: +date.get(ts), owner, location,
        points: flight?.points})) && props.onCancel()
    const onMapUpdate = (planet: Planet)=>{
        let pos = location?.pos || {col: 0, row: 0}
        const loc = {_id: planet._id, system: planet.system,
            name: planet.name, pos}
        setLocation(loc)
        props.onLocChanged(loc)        
    }
    return <RB.Row className='menu-input-row'>
      <RB.Col>
        {LR('flight_type_1')}
      </RB.Col>
      <RB.Col>
        <TimeInput value={ts} onChange={setTime} />
      </RB.Col>
      <RB.Col>
        <PSelect value={location?._id} onChange={val=>onMapUpdate(val)} />
      </RB.Col>
      <RB.Col>
        <RB.Button disabled={!check()} onClick={onSubmit}>{LR('act_flight_departure')}</RB.Button>
      </RB.Col>
    </RB.Row>
}

export function ListNavigator(props: {user: User}){
    const {user} = props
    return <List user={user} />
}

type FlightListState = {
    list?: Flight[]
    newForm: FlightSend
}
type FlightListProps = {
    user: User
}
export class List extends BaseList<FlightListProps, FlightListState> {
    L = L
    get title(){ return 'flights_listing' }
    async onAction(name: string, flight: Flight){
        this.setState({err: null})
        const ret = await util.wget(`/api/ship/flight/${flight._id}/action/${name}`,
            {method: 'PUT', data: {data: flight}})
        if (ret.err)
            return void this.setState({err: ret.err})
        this.fetch()
        return true
    }
    getRow(flight: Flight){
        return <FlightRow key={`flight_list_${flight._id}`} flight={flight}
          onAction={(s, f)=>this.onAction(s, f)} user={this.props.user}
          actionsClass={FlightActions} />
    }
    updateForm(val: any){
        this.setState({newForm: {...this.state.newForm, ...val}}) }
    get rowNew(){ 
        const {user} = this.props
        if (+user.relation?.type != InstitutionType.Ship)
            return <></>
        const {newForm} = this.state
        return <FlightRowNew user={user} flight={this.state.newForm}
            onSubmit={f=>this.onAction('signup', f)}
            onCancel={()=>this.setState({newForm: null})}
            onLocChanged={location=>this.updateForm({location})}
             />
    }
    onPointClick(pos: Pos){
        let points = this.state.newForm?.points||[]
        let pmatch = p=>p.col==pos.col && p.row == pos.row
        if (points.some(pmatch))
            points = points.filter(p=>!pmatch(p))
        else {
            if (points.length < 5)
                points = [...points, pos]
        }
        if (points!=this.state.newForm?.points)
            this.updateForm({points})
    }
    get mapView(){
        const {user} = this.props
        const id = this.state.newForm?.location?._id
        if (!id)
            return <></>
        const points = this.state.newForm.points||[]
        return <PlanetView user={user} id={id} markedPoints={points}
            onPointClick={pos=>this.onPointClick(pos)} />
    }
}
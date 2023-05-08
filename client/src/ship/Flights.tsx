import React from 'react';
import * as RB from 'react-bootstrap'
import {
    Item, Flight, User, UserType, FlightStatus, Location,
    UserTypeIn, OwnerMatch, FlightType, Planet, InstitutionType,
    Pos, PlanetShip, ShipClass, Owner,
} from '../common/entity'
import {List as UList} from '../util/controls'
import {LocationCol} from '../inventory/Item/components';
import {default as L, LR} from './locale'
import { TimeInput } from 'src/util/inputs';
import {Select as PSelect} from '../map/List'
import { PlanetView } from '../map/Planet';
import {Pos as MPos} from '../common/map'
import * as util from '../common/util'
import * as date from '../common/date'
import * as mutil from '../common/map'
import { LocationSelectTrigger } from 'src/util/popovers';

export type FlightRowProps = {
    flight: Flight
    user: User
    editRow?: (params: FlightRowProps)=>React.ReactElement
    actionsClass?: (params: FlightRowProps)=>React.ReactElement
    onAction?: (action: string, flight: Flight, location?: Location)=>Promise<boolean>
    onSubmit?: (f: Flight)=>Promise<boolean>
    onDelete?: ()=>void
    onEdit?: ()=>void 
    onCancel?: ()=>void
}

export function FlightShipCol(params: FlightRowProps){
    const {flight} = params
    if (flight.owner)
        return <RB.NavLink href={`/ship/${flight.owner._id}`}>{flight.owner.name}</RB.NavLink>
    return 
}

export function FlightLocationCol(params: FlightRowProps){
    const {flight, user} = params
    if (!flight.owner)
        return <RB.Col>-</RB.Col>
    const allowed = OwnerMatch(flight.owner, user.relation) ||
        UserTypeIn(user, UserType.Guard | UserType.Master)
    if (!allowed)
        return <RB.Col>{L('desc_info_hidden')}</RB.Col>
    return <LocationCol item={(flight as unknown) as Item}
        hide_pos={true} layout={null} />
}

function FlightButton(props: FlightRowProps & {type: string}){
    const {type, flight, onAction} = props
    const desc = L(`act_flight_${type}`)
    if (type!=='signup')
        return <RB.Button onClick={()=>onAction(type, flight)}>{desc}</RB.Button>
    return <LocationSelectTrigger desc={desc} location={flight.location}
        onClick={location=>onAction(type, {...flight, location} as Flight)} />
}

function FlightActions(props: FlightRowProps){
    const {flight, user} = props
    if (flight.owner && flight.arrival)
        return <RB.Col></RB.Col>
    const sp = s=>s.split(' ')
    const owner = UserTypeIn(user, UserType.Master | UserType.Guard) ||
        OwnerMatch(user.relation, flight.owner)
    const types = {
        [FlightType.Drone]: sp('signup delist retrive'),
        [FlightType.Planetary]: sp('signup delist block unblock departure arrival help'),
        [FlightType.Emergency]: sp('signup delist block unblock departure arrival help')
    }
    const actions = {
        [UserType.Scientist]: sp('signup'),
        [UserType.Captain]: sp('delist signup retrive'),
        [UserType.Guard]: sp('block help unblock'),
        [UserType.Master]: sp('block delist departure retrive arrival unblock'),
    }
    const statuses = {
       [FlightStatus.Docked]: sp('block signup'),
       [FlightStatus.Waiting]: sp('block delist departure'),
       [FlightStatus.InFlight]: sp('arrival retrive'),
       [FlightStatus.Research]: sp('retrive'),
       [FlightStatus.SOS]: sp('arrival help'),
       [FlightStatus.Blocked]: sp('unblock'),
    }
    const user_actions = [...new Set(Object.keys(actions)
        .filter(k=>UserTypeIn(user, +k)).map(a=>actions[a]).flat())]
    const btns = statuses[flight.status|0]
        .filter(s=>flight.owner ? owner : s==='signup')
        .filter(s=>!types[flight.type]||types[flight.type].includes(s))
        .filter(s=>user_actions.includes(s))
        .map(t=><FlightButton {...props} type={t} />)
    return <RB.Col>
      {btns}
    </RB.Col>
}

export function FlightTypeCol(props: FlightRowProps){
    const {flight, user} = props
    const master = UserTypeIn(user, UserType.Master)
    const allowed = master || flight.owner && 
        (UserTypeIn(user, UserType.Guard) || OwnerMatch(flight.owner, user.relation))
    const type = allowed ? LR(`flight_type_${flight.type}`) :
        flight.owner ? L('desc_info_hidden') : ' '
    return <RB.Col>{type}</RB.Col>
}

export function FlightStatusCol(props: FlightRowProps){
    const {flight, user} = props
    const allowed = OwnerMatch(flight.owner, user.relation) ||
        UserTypeIn(user, UserType.Guard | UserType.Master)
    const status = []
    if (!flight.owner)
        status.push(' ')
    else if (!allowed)
        status.push(L('desc_info_hidden'))
    else if (!flight.arrival){
        status.push(LR(`flight_status_${flight.status}`))
        if (flight.visit)
            status.push(date.timeday(flight.visit))
        else if(flight.departure)
            status.push(date.timeday(flight.departure))
    } else
        status.push(L('desc_arrived'), date.timeday(flight.arrival))
    return <RB.Col>{status.join(' ')}</RB.Col>
}

export function FlightRow(props: FlightRowProps) {
    const {flight} = props
    const [edit, setEdit] = React.useState(false)
    if (edit && props.editRow)
        return <props.editRow {...props} onCancel={()=>setEdit(false)} />
    return <RB.Row className="menu-list-row">
      <RB.Col>{date.timeday(flight.ts, {month: 'numeric'})}</RB.Col>
      <RB.Col><FlightShipCol {...props} /></RB.Col>
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
    sort(a: Flight, b: Flight){ return 0 }
    getRow(flight: Flight){ return <></> }
    body(){
        const {list, err} = this.state
        const rows = list.sort(this.sort).map(l=>this.getRow(l))
        const map = this.mapView
        return [!map && this.rowNew,
        <RB.Row key={'ship_list_title'} className="menu-list-title">
          <RB.Col>{LR('desc_time')}</RB.Col>
          <RB.Col>{LR('desc_ship')}</RB.Col>
          <RB.Col>{LR('flight_desc_type')}</RB.Col>
          <RB.Col>{LR('item_desc_target')}</RB.Col>
          <RB.Col>{LR('flight_desc_status')}</RB.Col>
          <RB.Col></RB.Col>
        </RB.Row>, ...rows, map ? this.rowNew : null, map]
    }
}

type FlightSend = Omit<Flight, 'name' | 'keys' | 'class' | 'status'>
type FlightRowNewParams = {
    flight: FlightSend
    prevPoints: Pos[]
    viewHidden?: boolean
    onSubmit: (f: FlightSend)=>Promise<boolean>
    onViewToggle: (state: boolean)=>void
    onLocChanged: (f: Location)=>void
} & Omit<FlightRowProps, 'actionsClass' | 'flight'>
function FlightRowNew(props: FlightRowNewParams){
    const {flight, user, prevPoints} = props
    const owner = user.relation
    const [ts, setTime] = React.useState(flight?.ts || date.add(undefined, {min: 10}))
    const [location, setLocation] = React.useState(flight?.location)
    const points_match = ()=> flight?.points?.length==prevPoints?.length &&
        !flight?.points?.some((k, i)=>MPos.getKey(k)!=MPos.getKey(prevPoints[i]))
    const check = ()=>ts && (location?._id && !isNaN(+location.pos.col) &&
        !isNaN(location?.pos?.row)) && flight?.points?.length &&
        !points_match() && !props.viewHidden
    const onSubmit = async ()=>check() && (await props.onSubmit({_id: flight._id,
        type: FlightType.Drone, ts: +date.get(ts), owner, location,
        points: flight?.points})) && props.onCancel()
    const onMapUpdate = (planet: Planet)=>{
        let pos = location?.pos
        if (!pos) {
            const size = mutil.Map.tileDimensions()
            const zone = planet.zones[0]
            const coords = mutil.Coordinates.Figures.circle(zone.center, zone.radius+2,
                zone.radius).filter(p=>p.col>=0 && p.row>=0 &&
                p.col<=size.width && p.row<=size.height)
            pos = coords[Math.floor(Math.random()*coords.length)]
        }
        const loc = {_id: planet._id, system: planet.system,
            name: planet.name, pos}
        setLocation(loc)
        props.onLocChanged(loc)        
    }
    if (flight?._id){
        return <RB.Row className='menu-input-row'>
          <RB.Col>{L('desc_control_drone')}</RB.Col>
          <RB.Col>{location.name}</RB.Col>
          <RB.Col>{LR('flight_status_'+((flight as any).status|0))}</RB.Col>
          {props.viewHidden && <RB.Col>
            <RB.Button onClick={()=>props.onViewToggle(false)}>{LR('act_show')}</RB.Button>
          </RB.Col>}
          {!props.viewHidden && <RB.Col>
            <RB.Button disabled={!check()} onClick={onSubmit}>{LR('act_update_drone')}</RB.Button>
            <RB.Button onClick={()=>props.onViewToggle(true)}>{LR('act_hide')}</RB.Button>
          </RB.Col>}
        </RB.Row>
    }
    return <RB.Row className='menu-input-row'>
      <RB.Col>
        { LR('flight_type_1')}
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
    viewHidden: boolean
    points: Pos[]
}
type FlightListProps = {
    user: User
}
export class List extends BaseList<FlightListProps, FlightListState> {
    L = L
    get title(){ return 'flights_listing' }
    fetchState(data: any = {}){
        const {list}: {list: Flight[]} = data
        this.retriveForm(list)
        return {item: data, list}
    }
    retriveForm(list: Flight[]){
        const {user} = this.props
        const drone = list.find(f=>f.type===FlightType.Drone &&
            OwnerMatch(f.owner, user?.relation))
        if (drone){
            this.updateForm({...drone})
            this.setState({viewHidden: true, points: [...(drone.points||[])]})
        }
    }
    sort(a: Flight, b: Flight){ 
        return a.type != b.type ? b.type-a.type : a.ts-b.ts }
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
        const {newForm, points, viewHidden} = this.state
        return <FlightRowNew user={user} flight={newForm} viewHidden={viewHidden}
            onSubmit={f=>this.onAction('drone_signup', f)} prevPoints={points}
            onViewToggle={v=>this.setState({viewHidden: v})} onCancel={()=>{}}
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
        const {user} = this?.props
        const {newForm} = this.state
        const id = newForm?.location?._id
        if (!id || this.state.viewHidden)
            return <></>
        // XXX need img
        const ship = {...(user?.relation||{} as Owner), location: newForm.location,
            _id: null, kind: ShipClass.D, img: '1'}
        const points = newForm.points||[]
        return <PlanetView user={user} id={id} markedPoints={points}
            ship={ship} onHexClick={pos=>this.onPointClick(pos)} />
    }
}
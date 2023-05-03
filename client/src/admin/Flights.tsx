import React from 'react'
import * as RB from 'react-bootstrap'
import {Flight, InstitutionType, Owner, User} from '../common/entity'
import {BaseList as FList, FlightRowProps, FlightRow} from '../ship/Flights'
import {FlightStatusSelect, FlightTypeSelect, LocationSelect, OwnerSelect, TimeInput} from 'src/util/inputs'
import {DataViewerButtons, EditButtons} from '../util/buttons'
import * as date from '../common/date'
import * as util from '../common/util'

function FlightActions(props: FlightRowProps){
    return <RB.Col>
      <DataViewerButtons {...props} />
    </RB.Col>
}

type FlightSend = Omit<Flight, 'name' | 'keys' | 'class'>
type FlightRowNewParams = {
    onSubmit: (f: FlightSend)=>Promise<boolean>
} & Omit<FlightRowProps, 'actionsClass'>
function FlightRowNew(props: FlightRowNewParams){
    const {flight} = props
    const [ts, setTime] = React.useState(flight?.ts || date.add(undefined, {min: 15}))
    const [owner, setOwner] = React.useState(flight?.owner)
    const [status, setfStatus] = React.useState(flight?.status)
    const [location, setLocation] = React.useState(flight?.location)
    const [type, setType] = React.useState(flight?.type)
    const add = !props.onCancel
    const ownerChange = (owner: Owner)=>{
        setOwner(owner)
        if (!owner){
            setfStatus(null)
            setType(null)
        }
    }
    const check = ()=>ts && (!owner || (owner._id && !isNaN(+owner.type) && (
        !location || (location._id && !isNaN(+location.pos.col) &&
        !isNaN(location.pos.row))) && !isNaN(+status) && !isNaN(+type)))
    const onSubmit = async ()=>check() && (await props.onSubmit({_id: flight?._id,
        type, ts: +date.get(ts), owner, location, status})) && props.onCancel()
    return <RB.Row className='menu-input-row'>
      <RB.Col>
        <TimeInput value={ts} onChange={setTime} />
      </RB.Col>
      <RB.Col>
        <OwnerSelect nullable={true} value={owner} onChange={ownerChange} exclude={[
          InstitutionType.Corporation, InstitutionType.Organization,
          InstitutionType.Research, InstitutionType.User]} />
      </RB.Col>
      <RB.Col>
        <FlightTypeSelect disabled={!owner?._id} value={type} onChange={setType} />
      </RB.Col>
      <RB.Col>
        <LocationSelect disabled={!owner?._id} value={location} onChange={setLocation} />
      </RB.Col>
      <RB.Col>
        <FlightStatusSelect disabled={!owner?._id} value={status} onChange={setfStatus} />
      </RB.Col>
      <RB.Col>
        <EditButtons add={add} disabled={!check()}
            onCancel={props.onCancel} onSubmit={onSubmit} />
      </RB.Col>
    </RB.Row>
}


type ListState = {
    newForm?: Flight
}
type ListProps = {
    user: User
}

export function ListNavigator(props: {user: User}){
    const {user} = props
    return <List user={user} />
}

class List extends FList<ListProps, ListState> {
    get fetchUrl() { return `/api/admin/flight/list` }
    get containerClass() { return 'menu-container-full' }
    async onSubmit(item: Flight){
        this.setState({err: null})
        const data = util.obj_copyto(item, new Flight())
        const res = await util.wget(`/api/admin/flight/${item._id||0}/set`,
            {method: 'POST', data: {data}})
        if (res.err)
            return void this.setState({err: res.err})
        this.fetch()
        return true
    }
    async deleteItem(item: Flight){
        const res = await util.wget(`/api/admin/flight/${item._id}/delete`,
            {method: 'DELETE'})
        if (res.err)
            return void this.setState({err: res.err})
        this.setState({err: null})
        this.fetch()
        return true
    }
    get rowNew(){
        return <FlightRowNew flight={this.state.newForm} user={this.props.user}
            onSubmit={f=>this.onSubmit(f)} />
    }
    getRow(flight: Flight){
        return <FlightRow key={`flight_list_${flight._id}`} flight={flight}
          onSubmit={f=>this.onSubmit(f)}
          onDelete={()=>this.deleteItem(flight)}
          user={this.props.user}
          actionsClass={FlightActions}
          editRow={FlightRowNew} />
    }
}
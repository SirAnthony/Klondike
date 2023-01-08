import React from 'react';
import * as RR from 'react-router-dom'
import * as F from '../Fetcher'
import Ship from './Ship'
import List from './List'
import {Ship as EShip, User} from '../common/entity'
import L from './locale'

type ShipDetailsState = {
    id: string
    ship?: EShip
}
type ShipDetailsProps = {
    user: User
    params: RR.Params
}
class ShipDetails extends F.Fetcher<ShipDetailsProps, ShipDetailsState> {
    constructor(props){
        super(props)
        this.state = {id: props.params.id}
    }
    get fetchUrl() {
        const {id} = this.state
        return `/api/ship/${id}`
    }
    fetchState(data: any){
        const {ship} = data
        return {item: data, ship}
    }
    render(){
        const {ship} = this.state
        if (!ship)
            return <div>{L('not_found')}</div>
        return <Ship ship={ship} />
    }
}

function ShipDetailsNavigator(props: {user: User}) {
    const params = RR.useParams()
    return <ShipDetails user={props.user} params={params} />
}

export function Navigator(props){
    const {user} = props
    return (<div>
      <RR.Routes>
        <RR.Route path='/' element={<ShipDetailsNavigator user={user} />} />
        <RR.Route path='/:id' element={<ShipDetailsNavigator user={user} />} />
        <RR.Route path='/all' />
      </RR.Routes>
    </div>)
}

export function ListNavigator(props: {user: User}){
    const {user} = props
    return <List user={user} />
}
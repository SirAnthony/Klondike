import React from 'react';
import * as RR from 'react-router-dom'
import * as F from '../Fetcher'
import Ship from './Ship'
import {Ship as EShip, User} from '../common/entity'

type ShipDetailsState = {
    ship?: EShip
}
type ShipDetailsProps = {
    user: User
}
class ShipDetails extends F.Fetcher<ShipDetailsProps, ShipDetailsState> {
    constructor(props){
        super(props)
    }
    get fetch_url() {
        return '/api/ship/'
    }
    render(){
        const {ship} = this.state
        return <Ship ship={ship} />
    }
}

export function Navigator(props){
    const {user, navigate} = props
    return (<div>
      <RR.Routes>
        <RR.Route path='/' element={<ShipDetails user={user} />} />
        <RR.Route path='/:id' element={<ShipDetails user={user} />} />
        <RR.Route path='/all' />
      </RR.Routes>
    </div>)
}
import React from 'react';
import * as RR from 'react-router-dom'
import List from './List'
import ShipDetails from './Details';
import {User} from '../common/entity'

function ShipDetailsNavigator(props: {user: User}) {
    const params = RR.useParams()
    return <ShipDetails user={props.user} id={params.id} />
}

export function Navigator(props){
    const {user} = props
    return (<div>
      <RR.Routes>
        <RR.Route path='/' element={<ShipDetailsNavigator user={user} />} />
        <RR.Route path='/:type/:id' element={<ShipDetailsNavigator user={user} />} />
        <RR.Route path='/:id' element={<ShipDetailsNavigator user={user} />} />
        <RR.Route path='/all' />
      </RR.Routes>
    </div>)
}

export function ListNavigator(props: {user: User}){
    const {user} = props
    return <List user={user} />
}
import React from 'react';
import * as RR from 'react-router-dom'
import {default as List, EditList} from './List'
import {User} from '../common/entity'
import {PlanetView} from './Planet';

function PlanetNavigator(props: {user: User}) {
    const params = RR.useParams()
    const {id} = params
    return <PlanetView user={props.user} id={id} />
}

export function Navigator(props){
    return (<div>
      <RR.Routes>
        <RR.Route path='/' element={<PlanetNavigator user={props.user} />} />
        <RR.Route path='/:id' element={<PlanetNavigator user={props.user} />} />
      </RR.Routes>
    </div>)
}

export function ListNavigator(props: {user: User}){
    const {user} = props
    return <List user={user} />
}

export function EditListNavigator(props: {user: User}){
    const {user} = props
    return <EditList user={user} />
}
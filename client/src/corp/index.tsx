import React from 'react';
import * as RR from 'react-router-dom'
import CorpDetails from './Corporation'
import List from './List'
import {User} from '../common/entity'

function CorpDetailsNavigator(props: {user: User}) {
    const params = RR.useParams()
    const {id} = params
    return <CorpDetails user={props.user} id={id} />
}

export function Navigator(props){
    const {user} = props
    return (<div>
      <RR.Routes>
        <RR.Route path='/' element={<CorpDetailsNavigator user={user} />} />
        <RR.Route path='/:id' element={<CorpDetailsNavigator user={user} />} />
        <RR.Route path='/all' />
      </RR.Routes>
    </div>)
}

export function ListNavigator(props: {user: User}){
    const {user} = props
    return <List user={user} />
}
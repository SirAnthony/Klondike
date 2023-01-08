import React from 'react';
import * as RR from 'react-router-dom'
import * as F from '../Fetcher'
import Corporation from './Corporation'
import List from './List'
import {Corporation as ECorp, User} from '../common/entity'
import L from './locale'

type CorpDetailsState = {
    id: string
    corp?: ECorp
}
type CorpDetailsProps = {
    user: User
    params: RR.Params
}

class CorpDetails extends F.Fetcher<CorpDetailsProps, CorpDetailsState> {
    constructor(props){
        super(props)
        this.state = {id: props.params.id}
    }
    get fetchUrl() {
        const {id} = this.state
        return `/api/corp/${id}`
    }
    fetchState(data: any = {}){
        const {corp} = data
        return {item: data, corp}
    }
    render(){
        const {corp} = this.state
        if (!corp)
            return <div>{L('not_found')}</div>
        return <Corporation corp={corp} />
    }
}

function CorpDetailsNavigator(props: {user: User}) {
    const params = RR.useParams()
    return <CorpDetails user={props.user} params={params} />
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
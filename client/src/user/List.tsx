import React from 'react'
import * as RB from 'react-bootstrap'
import {User} from '../common/entity'
import * as util from '../common/util'
import {List as UList} from '../util/controls'
import {ErrorMessage} from '../util/errors'
import L from './locale'

function UserRow(params: {user: User}) {
    const {user} = params
    return <RB.Row className="menu-list-row">
      <RB.Col><RB.NavLink href={`/profile/${user._id}`}>{user.name}</RB.NavLink></RB.Col>
    </RB.Row>
}

type UserListState = {
    list?: User[]
}
type UserListProps = {
    user: User
}

export function ListNavigator(props: {user: User}){
    const {user} = props
    return <List user={user} />
}

export default class List extends UList<UserListProps, UserListState> {
    L = L
    get fetchUrl() { return `/api/users/` }
    body(){
        if (!this.props.user?.admin)
            return [<ErrorMessage message={this.L('error_restricted')} />]
        const {list} = this.state
        const rows = list.map(l=><UserRow key={`ship_list_${l._id}`} user={l} />)
        return [<RB.Row key={'user_list_title'} className="menu-list-title">
            <RB.Col>{L('desc_name')}</RB.Col>
        </RB.Row>, ...rows]
    }
}
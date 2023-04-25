import React from 'react';
import List from './List'
import {User} from '../common/entity'

export function ListNavigator(props: {user: User}){
    const {user} = props
    return <List user={user} />
}
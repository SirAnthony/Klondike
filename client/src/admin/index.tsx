import React from 'react';
import * as RR from 'react-router-dom'
import * as RB from 'react-bootstrap'
import {User} from '../common/entity'
import {Menu as UMenu} from '../util/controls' 
import {ListNavigator as ShipListNavigator} from '../ship'
import {ListNavigator as CorpListNavigator} from '../corp'
import {ListNavigator as ItemsNavigator} from './Items'
import {ListNavigator as OrdersNavigator} from './Orders'
import {ListNavigator as MapListNavigator} from '../map'
import {ListNavigator as UserListNavigator} from '../user/List'
import {Navigator as RatingNavigator} from './Rating'
import L from './locale'

type ListState = {

}
type ListProps = {
    user: User
}
class ListNavigator extends UMenu<ListProps, ListState> {
    L = L
    body(){
        return ['rating', 'orders', 'resources', 'ships', 'corps', 'planets', 'users'].map(f=>
        <RB.Row key={`admin_list_${f}`} className='menu-list-row'>
          <RB.Col><RB.NavLink href={`/admin/${f}/`}>{this.L(`link_${f}`)}</RB.NavLink></RB.Col>
        </RB.Row>)
    }
}

export function Navigator(props) {
    const {user} = props
    return (<div>
      <RR.Routes>
        <RR.Route path='/' element={<ListNavigator user={user} />} />
        <RR.Route path='/rating' element={<RatingNavigator user={user} />} />
        <RR.Route path='/orders' element={<OrdersNavigator user={user} />} />
        <RR.Route path='/resources' element={<ItemsNavigator user={user} />} />
        <RR.Route path='/ships' element={<ShipListNavigator user={user} />} />
        <RR.Route path='/corps' element={<CorpListNavigator user={user} />} />
        <RR.Route path='/planets' element={<MapListNavigator user={user} />} />
        <RR.Route path='/users' element={<UserListNavigator user={user} />} />
      </RR.Routes>
    </div>)
}
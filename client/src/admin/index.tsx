import React from 'react';
import * as RR from 'react-router-dom'
import * as RB from 'react-bootstrap'
import {User} from '../common/entity'
import {Menu as UMenu} from '../util/controls' 
import {ListNavigator as ShipListNavigator} from '../ship'
import {ListNavigator as CorpListNavigator} from '../corp'
import {ListNavigator as ItemsNavigator} from './Items'
import {ListNavigator as OrdersNavigator} from './Orders'
import {ListNavigator as FlightListNavigator} from './Flights'
import {EditListNavigator as MapListNavigator} from '../map'
import {ListNavigator as UserListNavigator} from '../user/List'
import {ListNavigator as LogsListNavigator} from './Logs'
import {Navigator as RatingNavigator} from './Rating'
import { TextInput } from '../util/inputs';
import { PopupButton } from '../util/buttons';
import L from './locale'

const Navigators = {
    'rating': RatingNavigator,
    'orders': OrdersNavigator,
    'resources': ItemsNavigator,
    'ships': ShipListNavigator,
    'corps': CorpListNavigator,
    'flights': FlightListNavigator,
    'planets': MapListNavigator,
    'users': UserListNavigator,
    'logs': LogsListNavigator,
    'qrcode': QRCodeNavigator,
}

type ListState = {

}
type ListProps = {
    user: User
}
class ListNavigator extends UMenu<ListProps, ListState> {
    L = L
    body(){
        return Object.keys(Navigators).map(f=>
        <RB.Row key={`admin_list_${f}`} className='menu-list-row'>
          <RB.Col><RB.NavLink href={`/admin/${f}/`}>{this.L(`link_${f}`)}</RB.NavLink></RB.Col>
        </RB.Row>)
    }
}

export function ButtonNavigator(props: {user: User}){
    const {user} = props
    if (!user.admin)
        return null
    const btns = Object.keys(Navigators).map(k=><RB.Col>
      <RB.NavLink href={`/admin/${k}`} >{L(`link_${k}`)}</RB.NavLink>
    </RB.Col>)
    return <RB.Row>
      {btns}
    </RB.Row>
}

export function Navigator(props) {
    const {user} = props
    const urls = Object.keys(Navigators).map(c=>{
        const obj = {t: Navigators[c]}
        return <RR.Route path={`/${c}`} element={<obj.t user={user} />} />
    })
    return (<div>
      <RR.Routes>
        <RR.Route path='/' element={<ListNavigator user={user} />} />
        {urls}
      </RR.Routes>
    </div>)
}

export function QRCodeNavigator(props: {user: User}){
    const {user} = props
    const [data, setData] = React.useState(null)
    if (!user.admin)
        return null
    return <RB.Container className='menu-box'>
      <RB.Row>
          <TextInput as={'textarea'} value={data} onChange={setData}
            placeholder='text' />
          <PopupButton url={`/qrcode/${data}`} desc={'show'} />
      </RB.Row>
    </RB.Container>
}
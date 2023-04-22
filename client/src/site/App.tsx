import React from 'react';
import * as RR from 'react-router-dom'
import * as RB from 'react-bootstrap'
import {UserBar} from '../user/Bar'
import {UserFooter} from '../user/Footer'
import * as entity from '../common/entity'
import {Menu} from '../util/controls'
import {Navigator as ShipNavigator} from '../ship'
import {Navigator as CorpNavigator} from '../corp'
import {Navigator as MapNavigator, ListNavigator as PlanetListNavigator} from '../map'
import {Navigator as AdminNavigator} from '../admin'
import {Navigator as UserProfileNavigator} from '../user/Profile'
import {Confirmator} from '../inventory';
import L from './locale'
import './App.css';

type ListState = {}
type ListProps = {user: entity.User}
class ListNavigator extends Menu<ListProps, ListState> {
    L = L
    body(){
        return ['ship', 'ships', 'corp', 'corps', 'map', 'planets'].map(f=>
        <RB.Row key={`index_list_${f}`} className='menu-list-row'>
          <RB.Col><RB.NavLink href={`/${f}/`}>{this.L(`interface_${f}`)}</RB.NavLink></RB.Col>
        </RB.Row>)
    }
}

function App() {
  const [user, setUser] = React.useState(null)
  const onUserUpdate = (u: entity.User)=>{ setUser(u) }
  const is_admin = user && (user as entity.User).admin
  return (<div className="App">
  <RR.BrowserRouter>
    <RB.Container className="app-head">
      <UserBar onUserUpdate={onUserUpdate} />
    </RB.Container>
    <RR.Routes>
      <RR.Route path='/' element={<ListNavigator user={user} />} />
      <RR.Route path='/confirm/*' element={<Confirmator user={user} />} />
      <RR.Route path='/ship/*' element={<ShipNavigator user={user} />} />
      <RR.Route path='/corp/*' element={<CorpNavigator user={user} />} />
      <RR.Route path='/lab/*' element={<CorpNavigator user={user} />} />
      <RR.Route path='/map/*' element={<MapNavigator user={user} />} />
      <RR.Route path='/planet/*' element={<MapNavigator user={user} />} />
      <RR.Route path='/planets/' element={<PlanetListNavigator user={user} />} />
      <RR.Route path='/profile' element={<UserProfileNavigator user={user} />} />
      <RR.Route path='/profile/*' element={<UserProfileNavigator user={user} />} />
      { is_admin && <RR.Route path='/admin/*' element={<AdminNavigator user={user} />} />}
      { is_admin && <RR.Route path='/admin/' element={<AdminNavigator user={user} />} />}
    </RR.Routes>
    <UserFooter user={user}></UserFooter>
  </RR.BrowserRouter>
  </div>);
}

export default App;

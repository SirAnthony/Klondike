import React from 'react';
import * as RR from 'react-router-dom'
import * as RB from 'react-bootstrap'
import {UserBar} from '../user/Bar'
import {UserProfile} from '../user/Profile'
import * as entity from '../common/entity'
import {Navigator as ShipNavigator, ListNavigator as ShipListNavigator} from '../ship'
import {Navigator as CorpNavigator, ListNavigator as CorpListNavigator} from '../corp'
import {Navigator as MapNavigator} from '../map'
import L from './locale'
import './App.css';

function BasicNavigator(props){
    const navigate = RR.useNavigate()
    return <RB.Container>
      <RB.Row>
        <RB.Col>
          <RB.NavLink href="/ship/">{L('interface_ship')}</RB.NavLink>
          <RB.NavLink href="/ships/">{L('interface_ship_list')}</RB.NavLink>
          <RB.NavLink href="/corp/">{L('interface_corp')}</RB.NavLink>
          <RB.NavLink href="/corps/">{L('interface_corp_list')}</RB.NavLink>
          <RB.NavLink href="/map/">{L('interface_map')}</RB.NavLink>
        </RB.Col>
      </RB.Row>
    </RB.Container>
}

function App() {
  const [user, setUser] = React.useState(null)
  const onUserUpdate = (u: entity.User)=>{ setUser(u) }
  return (<div className="App">
  <RR.BrowserRouter>
    <RB.Container className="app-head">
      <UserBar onUserUpdate={onUserUpdate} />
    </RB.Container>
    <RR.Routes>
      <RR.Route path='/' element={<BasicNavigator user={user} />} />
      <RR.Route path='/map' element={<MapNavigator user={user} />} />
      <RR.Route path='/ship/*' element={<ShipNavigator user={user} />} />
      <RR.Route path='/ships/' element={<ShipListNavigator user={user} />} />
      <RR.Route path='/corp/*' element={<CorpNavigator user={user} />} />
      <RR.Route path='/corps/' element={<CorpListNavigator user={user} />} />
      <RR.Route path='/account/profile' element={<UserProfile user={user} />} />
    </RR.Routes>
  </RR.BrowserRouter>
  </div>);
}

export default App;

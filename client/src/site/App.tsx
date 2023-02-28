import React from 'react';
import * as RR from 'react-router-dom'
import * as RB from 'react-bootstrap'
import {UserBar} from '../user/Bar'
import {UserProfile} from '../user/Profile'
import * as entity from '../common/entity'
import {Navigator as ShipNavigator} from '../ship'
import {Navigator as CorpNavigator} from '../corp'
import {Navigator as MapNavigator, ListNavigator as PlanetListNavigator} from '../map'
import {Navigator as AdminNavigator} from '../admin'
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
          <RB.NavLink href="/planets/">{L('interface_planet_list')}</RB.NavLink>
        </RB.Col>
      </RB.Row>
    </RB.Container>
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
      <RR.Route path='/' element={<BasicNavigator user={user} />} />
      <RR.Route path='/ship/*' element={<ShipNavigator user={user} />} />
      <RR.Route path='/corp/*' element={<CorpNavigator user={user} />} />
      <RR.Route path='/map/*' element={<MapNavigator user={user} />} />
      <RR.Route path='/planet/*' element={<MapNavigator user={user} />} />
      <RR.Route path='/planets/' element={<PlanetListNavigator user={user} />} />
      <RR.Route path='/account/profile' element={<UserProfile user={user} />} />
      { is_admin && <RR.Route path='/admin/*' element={<AdminNavigator user={user} />} />}
    </RR.Routes>
  </RR.BrowserRouter>
  </div>);
}

export default App;

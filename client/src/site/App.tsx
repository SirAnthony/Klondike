import React from 'react';
import * as RR from 'react-router-dom'
import * as RB from 'react-bootstrap'
import {UserBar} from '../user/Bar'
import {UserFooter} from '../user/Footer'
import * as entity from '../common/entity'
import {Menu} from '../util/controls'
import {Navigator as ShipNavigator} from '../ship'
import {Navigator as InventoryNavigator} from '../inventory'
import {Navigator as MapNavigator, ListNavigator as PlanetListNavigator} from '../map'
import {ListNavigator as FlightNavigator} from '../ship/Flights'
import {Navigator as AdminNavigator, QRCodeNavigator} from '../admin'
import {Navigator as UserProfileNavigator} from '../user/Profile'
import {ListNavigator as FinesNavigator } from '../user/Fines';
import {Confirmator} from '../inventory';
import { Modal } from '../inventory/modal';
import L from './locale'
import './App.css';
import { ConfigFetcher } from './Config';

type ListState = {}
type ListProps = {user: entity.User}
class ListNavigator extends Menu<ListProps, ListState> {
    L = L
}


type EndGameProps = {}
type EndGameState = {
    endgame: boolean
    hidden: boolean
}
class EndGamePopup extends ConfigFetcher<EndGameProps, EndGameState> {
    L = L
    fetchState(data: any){ 
      // Missing fields
      data.time = data.time||{}
      data.time.ship = data.time.ship||{}
      return {item: data, endgame: data.endgame}
    }
    render(){
      const {endgame, hidden} = this.state
      if (!endgame)
          return null
      return <Modal show={endgame && !hidden} title={L('title_endgame')}
          onAgree={()=>this.setState({hidden: true})} >
          <RB.Container>
            <RB.Row className='endgame-desc'><span>{L('endgame_desc')}</span></RB.Row>
            <RB.Row className='endgame-desc'><span>{L('endgame_desc2')}</span></RB.Row>
            <RB.Row className='endgame-comment'><span>{L('endgame_comment')}</span></RB.Row>
          </RB.Container>
      </Modal>

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
      <EndGamePopup />
    </RB.Container>
    <RR.Routes>
      <RR.Route path='/' element={<ListNavigator user={user} />} />
      <RR.Route path='/confirm/*' element={<Confirmator user={user} />} />
      <RR.Route path='/ship/*' element={<ShipNavigator user={user} />} />
      <RR.Route path='/inventory/*' element={<InventoryNavigator user={user} />} />
      <RR.Route path='/map/*' element={<MapNavigator user={user} />} />
      <RR.Route path='/maps/*' element={<PlanetListNavigator user={user} />} />
      <RR.Route path='/planet/*' element={<MapNavigator user={user} />} />
      <RR.Route path='/planets/' element={<PlanetListNavigator user={user} />} />
      <RR.Route path='/flights/*' element={<FlightNavigator user={user} />} />
      <RR.Route path='/flights' element={<FlightNavigator user={user} />} />
      <RR.Route path='/fines/*' element={<FinesNavigator user={user} />} />
      <RR.Route path='/fines' element={<FinesNavigator user={user} />} />
      <RR.Route path='/profile' element={<UserProfileNavigator user={user} />} />
      <RR.Route path='/profile/*' element={<UserProfileNavigator user={user} />} />
      { is_admin && <RR.Route path='/admin/*' element={<AdminNavigator user={user} />} />}
      { is_admin && <RR.Route path='/admin/' element={<AdminNavigator user={user} />} />}
      { is_admin && <RR.Route path='/qrcode/*' element={<QRCodeNavigator user={user} />} />}
      { is_admin && <RR.Route path='/qrcode' element={<QRCodeNavigator user={user} />} />}
    </RR.Routes>
    {user && <UserFooter user={user}></UserFooter>}
  </RR.BrowserRouter>
  </div>);
}

export default App;

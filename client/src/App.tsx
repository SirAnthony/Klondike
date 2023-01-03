import React from 'react';
import * as RR from 'react-router-dom'
import * as RB from 'react-bootstrap'
import {UserBar} from './user/Bar'
import {UserProfile} from './user/Profile'
import * as entity from './common/entity'
import {Navigator as Ship} from './ship'
import './App.css';

function BasicNavigator(props){
    const navigate = RR.useNavigate()
    return <></>
}
function ShipNavigator(props){
    const navigate = RR.useNavigate()
    return <Ship user={props.user} navigate={navigate} />
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
      <RR.Route path='/ship' element={<ShipNavigator user={user} />} />
      <RR.Route path='/account/profile' element={<UserProfile user={user} />} />
    </RR.Routes>
  </RR.BrowserRouter>
  </div>);
}

export default App;

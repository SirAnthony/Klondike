import React from 'react';
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import * as entity from '../common/entity'
import EventEmitter from '../common/events'
import {UserLogin, UserLoginNav} from './Login'
import {UserRegister, UserRegisterNav} from './Register'
import L from '../common/locale'

const BarEvents = new EventEmitter()
export function requestReload(){
    BarEvents.emit('reload') }

type UserBarState = {
    item?: entity.User
    reg: Boolean
    login: Boolean
}

type UserBarProps = {
    onUserUpdate: (user: entity.User)=>void
}

export class UserBar extends F.Fetcher<UserBarProps, UserBarState> {
    fetch_url = '/auth/info'
    constructor(props){
        super(props)
        this.state = {reg: false, login: false}
        this.toggle_reg = this.toggle_reg.bind(this)
        this.toggle_login = this.toggle_login.bind(this)
        BarEvents.on('reload', ()=>this.fetch())
    }
    fetchState(data: any){
        let item: entity.User
        if (data){
            item = new entity.User()
            for (let k in data)
                item[k] = data[k]
        }
        this.props.onUserUpdate(item)
        return {item}
    }
    toggle_reg(reg){
        this.setState({reg, login: reg ? false : this.state.login}) }
    toggle_login(login){
        this.setState({login, reg: login ? false : this.state.reg}) }
    render(){
        const user = this.state?.item
        const {reg, login} = this.state
        return <RB.Container><RB.Navbar>
          <RB.Navbar.Brand href="/">{L('site_title')}</RB.Navbar.Brand>
          <RB.Navbar.Toggle />
          <RB.Navbar.Collapse className='justify-content-end'>
            { !user && <UserLoginNav value={login} onClick={this.toggle_login}/> }
            { !user && <UserRegisterNav value={reg} onClick={this.toggle_reg}/> }
            { user && <RB.Nav>
              <RB.NavDropdown title={user.displayName||L('site_account')}>
                <RB.NavDropdown.Item href="/account/profile">Профиль</RB.NavDropdown.Item>
                { user.admin && <RB.NavDropdown.Item href="/admin/main">Администрирование</RB.NavDropdown.Item> }
                <RB.NavDropdown.Item href="/auth/logout">Выйти</RB.NavDropdown.Item>
              </RB.NavDropdown>
            </RB.Nav> }
          </RB.Navbar.Collapse>
        </RB.Navbar><RB.Row>
          { !user && reg && !login && <UserRegister parent={this} />}
          { !user && login && !reg && <UserLogin parent={this} />}
        </RB.Row></RB.Container>
    }
}
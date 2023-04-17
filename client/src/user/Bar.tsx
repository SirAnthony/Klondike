import React from 'react';
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import * as entity from '../common/entity'
import EventEmitter from '../common/events'
import {UserLogin, UserLoginNav} from './Login'
import {UserRegister, UserRegisterNav} from './Register'
import {default as L, LR} from './locale'
import {TimeDetails} from '../inventory/Time';

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
    L = L
    get fetchUrl(){ return '/auth/info' }
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
          <div><TimeDetails /></div>
          <RB.Navbar.Toggle />
          <RB.Navbar.Collapse className='justify-content-end'>
            { !user && <UserLoginNav value={login} onClick={this.toggle_login}/> }
            { false && !user && <UserRegisterNav value={reg} onClick={this.toggle_reg}/> }
            { user && <RB.Nav>
              <RB.NavDropdown title={user.displayName||LR('site_account')}>
                <RB.NavDropdown.Item href="/account/profile">{this.L('profile')}</RB.NavDropdown.Item>
                { user.admin && <RB.NavDropdown.Item href="/admin/">{this.L('button_admin')}</RB.NavDropdown.Item> }
                <RB.NavDropdown.Item href="/auth/logout">{this.L('button_logout')}</RB.NavDropdown.Item>
              </RB.NavDropdown>
            </RB.Nav> }
          </RB.Navbar.Collapse>
        </RB.Navbar><RB.Row>
          { false && !user && reg && !login && <UserRegister parent={this} />}
          { !user && login && !reg && <UserLogin parent={this} />}
        </RB.Row></RB.Container>
    }
}
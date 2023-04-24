import React from 'react';
import * as RB from 'react-bootstrap'
import * as util from '../common/util'
import * as CError from '../common/errors'
import {ErrorMessage} from '../util/errors'
import {UserBar} from './Bar'
import L from './locale'
import {LoginInput, TextInput} from '../util/inputs';

type UserLoginProps = {
    parent: UserBar
}
type UserLoginState = {
    err?: CError.ApiError
}
type EmailProps = {
    email: string
    password: string
}

export function UserLoginNav(props: {value: Boolean, onClick: (val: Boolean)=>void}){
    const click = ()=>props.onClick(!props.value)
    const nav_text = L('login_nav', props.value ? '△' : '▽')
    return <RB.Container>
      <RB.Row>
        <RB.Col xl={4} md={5}>
          { false && <a href="/auth/oauth/vk">
            <button className='vk_flat_button wauth_auth'>{L('login_nav_vk')}</button>
          </a> }
        </RB.Col>
        <RB.Col>
          <RB.Nav.Link className='nowrap' onClick={click}>{nav_text}</RB.Nav.Link>
        </RB.Col>
      </RB.Row>
    </RB.Container>
}

function UserLoginEmail(props: {onSubmit: (data: EmailProps)=>void}){
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const submit = (ev)=>{
        ev.preventDefault(); props.onSubmit({email, password}) }
    return <RB.Form autoComplete='on'><RB.Row>
      <RB.Col sm={4}>
        <LoginInput name='login_email' placeholder={L('field_email')}
          value={email} onChange={setEmail} autoComplete={true} /></RB.Col>
      <RB.Col sm={4}>
        <TextInput type='password' name='login_password' placeholder={L('field_password')}
          value={password} onChange={setPassword} autoComplete={true} />
      </RB.Col>
      <RB.Col sm={2}><RB.Button onClick={submit}>{L('button_signin')}</RB.Button></RB.Col>
    </RB.Row></RB.Form>
}

export class UserLogin extends React.Component<UserLoginProps, UserLoginState> {
    constructor(props: UserLoginProps){
        super(props)
        this.state = {err: null}
        this.sendLogin = this.sendLogin.bind(this)
    }
    async sendLogin(data){
        this.setState({err: null})
        let res = await util.wget('/auth/login', {method: 'POST', data})
        if (res.err)
            return this.setState({err: res.err})
        else
            await this.props.parent.fetch()
    }
    errorField(name){
        const {err} = this.state
        if (!err.valid || !err.stack || +err.code!==CError.Codes.INCORRECT_PARAM)
            return null
        const field = err.stack.find((f: CError.FormValidationError)=>f.field===name)
        return field ? <ErrorMessage field={field} /> : null
    }
    errorRow(){
        const {err} = this.state
        if (!err)
            return null
        const valid = +err.code!==CError.Codes.INCORRECT_PARAM
        const fields = valid ? [] : ['email', 'password']
        const errors = fields.map(t=>
            <RB.Col sm={4} key={"login_"+t}>{this.errorField(t)}</RB.Col>)
        errors.push(<RB.Col key="login_all">{valid ? <ErrorMessage field={err.stack} /> : null}</RB.Col>)
        return errors
    }
    render(){
        return <RB.Container>
          <RB.Row className='menu-input-row'>
            <UserLoginEmail onSubmit={this.sendLogin} />
          </RB.Row>
          <RB.Row>{this.errorRow()}</RB.Row>
        </RB.Container>
    }
}


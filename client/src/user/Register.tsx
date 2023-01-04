import React from 'react';
import * as RB from 'react-bootstrap'
import * as util from '../common/util'
import * as CError from '../common/errors'
import {ErrorMessage} from '../util/errors'
import {UserBar} from './Bar'
import L from '../common/locale'

type UserRegisterProps = {
    parent: UserBar
}
type UserRegisterState = {
    err?: CError.ApiError
    email: string
    first_name: string
    second_name: string
    last_name: string
    alias: string
    password: string
    confirm: string
    phone: string
    age: number
}
enum FormFields {
    EMPTY, ERROR, SUBMIT
}

export function UserRegisterNav(props: {value: Boolean, onClick: (val: Boolean)=>void}){
    const click = ()=>props.onClick(!props.value)
    const nav_text = L('register_nav', props.value ? '△' : '▽')
    return <RB.Nav.Item className='nowrap' onClick={click}>{nav_text}</RB.Nav.Item>
}

export class UserRegister extends React.Component<UserRegisterProps, UserRegisterState> {
    layout = [
        ['email', 'phone', 'alias'],
        ['first_name', 'second_name', 'last_name'],
        ['age', 'password', 'confirm'],
        [FormFields.ERROR, FormFields.SUBMIT],
    ]
    fields = []
    field_opt = {
        nonempty: ['email', 'password'],
        types: {
            confirm: 'password',
        },
    }
    constructor(props){
        super(props)
        this.state = {email: '', first_name: '', second_name: '',
            last_name: '', alias: '', password: '', confirm: '',
            phone: '', age: 0}
        this.fields = this.layout.flat().filter(f=>
            f && !Object.values(FormFields).includes(f))
        this.submit = this.submit.bind(this)
    }
    check_confirm(){
        const {password, confirm} = this.state
        if (!confirm)
            throw 'field_error_noempty'
        if (password != confirm)
            throw 'field_error_notmatch'
    }
    checkField(name){
        if (!this.fields.includes(name))
            throw 'field_error_unknown'
        let checker: Function = this[`check_${name}`]
        if (checker)
            checker.call(this)
        let value = this.state[name]
        if (this.field_opt.nonempty.includes(name) && !value)
            throw 'field_error_noempty'
    }
    validate() : CError.ApiError {
        const err: CError.FormValidationError[] = []
        const code = CError.Codes.INCORRECT_PARAM
        for (let field of this.fields){
            try { this.checkField(field) }
            catch(e) { err.push({code, field, message: e.message||e}) }
        }
        if (err.length)
            return new CError.ApiError(code, 'form_error_notvalid', err)
    }
    async submit(){
        const {state} = this
        let err = this.validate()
        if (err)
            return this.setState({err})
        const data = this.fields.reduce((p, c)=>{
            if (this.state[c])
                p[c] = this.state[c]
            return p
        }, {})
        let res = await util.wget('/auth/signup', {method: 'POST', data})
        if (res.err)
            return this.setState({err: res.err})
        else
            await this.props.parent.fetch()
    }
    submitBtn(){
        return <RB.Button onClick={this.submit}>{L('button_reg')}</RB.Button>
    }
    field(name: string | FormFields){
        const {err} = this.state
        if (name===FormFields.EMPTY)
            return <RB.Col key="reg_field"></RB.Col>
        if (name==FormFields.ERROR)
            return <RB.Col key="reg_err_field" sm={6}><ErrorMessage field={err} /></RB.Col>
        if (name==FormFields.SUBMIT)
            return <RB.Col key="reg_submit">{this.submitBtn()}</RB.Col>
        let field = this.state?.err?.stack.find(
            (f: CError.FormValidationError)=>f?.field==name)
        let change = ({target: {value}})=>this.setState({[name]: value} as any)
        const type = this.field_opt.types[name]||name
        return <RB.Col key={'reg_field_'+name} sm={3}>
          <RB.FormLabel>{L('field_'+name)}</RB.FormLabel>
          <ErrorMessage className='error-field' field={field} />
          <RB.FormControl name={'reg_'+type} type={type} onChange={change}
            value={this.state[name]}></RB.FormControl>
        </RB.Col>
    }
    render(){
        const {state} = this
        let rows = this.layout.map((row, idx)=>
            <RB.Row key={"reg_row_"+idx}>{row.map(r=>this.field(r))}</RB.Row>)
        return <RB.Form autoComplete='on' className='form-register'>{rows}</RB.Form>
    }
}
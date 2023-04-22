import React from 'react';
import * as RR from 'react-router-dom'
import * as RB from 'react-bootstrap'
import * as util from '../common/util'
import * as CError from '../common/errors'
import {ErrorMessage} from '../util/errors'
import {User, ProfileFields} from '../common/entity'
import {ControlBar} from '../util/controls'
import * as F from '../Fetcher'
import L from './locale'
import EventEmitter from '../common/events'

const ProfileEvents = new EventEmitter()

type UserProfileProps = {
    id?: string
    user: User
}

type UserProfileState = {
    err?: CError.ApiError
    changed: boolean
    user: any
}

type ProfileFieldProps = {
    name: string
    value: string
    field: CError.ApiStackError
    onChange: (name: string, value: string)=>void
}

function ProfileField(props: ProfileFieldProps){
    const {name, field} = props
    const [edit, setEdit] = React.useState(false)
    const [value, setValue] = React.useState(props.value)
    const changeEdit = !ProfileFields.static.includes(name) && !edit ? ()=>setEdit(!edit) : null
    ProfileEvents.on('reset', ()=>setEdit(false))
    const change = ({target: {value}})=>{
        props.onChange(name, value)
        setValue(value)
    }
    return <RB.Row key={`profile_field_${name}`}>
      <RB.Col sm={3} className='profile-field'>{L(`field_${name}`)}</RB.Col>
      <RB.Col sm={3} className={`profile-${edit ? 'edit' : 'field'}`} onClick={changeEdit}>
        {!edit && <span>{value}</span>}
        {edit && <RB.FormControl name={`profile_${name}`} type='text'
            value={value} onChange={change}/>}
      </RB.Col>
      { field && <RB.Col><ErrorMessage field={field} /></RB.Col>}
    </RB.Row>
}

function PasswordField(props){
    const [reset, setReset] = React.useState(false)
    const [err, setErr] = React.useState(null)
    const sendReset = async function(){
        setErr(null)
        const data = {email: props.user.email};
        let res = await util.wget('/auth/forgot', {method: 'POST', data})
        if (res.err)
            return setErr(res.err)
        setReset(true)
    }
    return <RB.Row key={`profile_filed_password`}>
        <RB.Col sm={3} className='profile-field'>{L('password')}</RB.Col>
        {!reset && <RB.Col sm={3}>
          <RB.Button onClick={sendReset} value={L('reset_password')} />
        </RB.Col>}
        {reset && !err && <RB.Col>{reset && L('reset_password_sent')}</RB.Col>}
        {err && <RB.Col><ErrorMessage field={err} /></RB.Col>}
    </RB.Row>
}

function ProfileInfo(props: UserProfileProps){
    const {user} = props
    return <RB.Container>
      <RB.Row><RB.Col>
        <img src={`/static/img/users/user.png`} alt='user' />
      </RB.Col></RB.Row>
      <RB.Row>
        <RB.Col>{L('name')}</RB.Col>
        <RB.Col>{user.fullName}</RB.Col>
      </RB.Row>
      <RB.Row>
        <RB.Col>{L('credit')}</RB.Col>
        <RB.Col>{user.credit}</RB.Col>
      </RB.Row>
    </RB.Container>
}

function ProfileData(props: UserProfileProps){
    const {user} = props
    const {data} = user
    let txt = data.replace(/\{([^:]+):([^}]+)\}/g,
        '<a href="/profile/$2">$1</a>')
    return <div dangerouslySetInnerHTML={({__html: txt})} />
}

export class UserProfile extends F.Fetcher<UserProfileProps, UserProfileState> {
    get fetchUrl(){
        const {id = ''} = this.props
        return `/api/user/profile/${id}`
    }
    fetchState(data: any = {}){
        const user = data?.user ? new User() : undefined
        for (let k in data?.user||{})
            user[k] = data.user[k]
        return {item: data, user}
    }
    render(){
        const {user} = this.state||{}
        if (!user)
            return <RB.Container>No user</RB.Container>
        return <RB.Container className='menu-container'>
      <ControlBar title={L('interface')} />
        <RB.Row>
          <RB.Col className='menu-box-clear'>
            <ProfileInfo user={user} />
          </RB.Col>
          <RB.Col className='menu-box-col-clear'>
            <ProfileData user={user} />
          </RB.Col>
        </RB.Row>
      </RB.Container>
    }
}

function UserProfileNavigator(props: {user: User}) {
    const params = RR.useParams()
    const {id} = params
    return <UserProfile user={props.user} id={id} />
}

export function Navigator(props){
    const {user} = props
    return (<div>
      <RR.Routes>
        <RR.Route path='/' element={<UserProfileNavigator user={user} />} />
        <RR.Route path='/:id' element={<UserProfileNavigator user={user} />} />
      </RR.Routes>
    </div>)
}

/*
export class UserProfile extends React.Component<UserProfileProps, UserProfileState> {
    constructor(props: UserProfileProps){
        super(props)
        this.state = {user: this.props_user(props), changed: false}
        this.submit = this.submit.bind(this)
    }
    componentDidUpdate(prevProps: Readonly<UserProfileProps>, prevState: Readonly<UserProfileState>): void {
        if (prevProps==this.props)
            return
        this.setState({user: this.props_user(this.props)})
    }
    props_user(props){
        if (!props.user)
            return null
        return Object.assign({}, props.user)
    }
    async submit(){
        const {user} = this.state
        if (!user) {
            return this.setState({err: new CError.ApiError(
                CError.Codes.INCORRECT_PARAM, 'field_error_invalid')})
        }
        const data = util.obj_copyto(user, {}, Profile.fields.filter(k=>
            !Profile.static.includes(k)))
        let res = await util.wget('/api/profile', {method: 'POST', data})
        if (res.err)
            return this.setState({err: res.err})
        ProfileEvents.emit('reset')
        this.setState({user: res.data.user, changed: false, err: null})
    }
    field(name: string){
        const {user} = this.state
        let field = this.state?.err?.stack.find(
            (f: CError.FormValidationError)=>f?.field==name)
        const onChange = (name, value)=>{
            if (Profile.static.includes(name) || !Profile.fields.includes(name))
                return
            const user = this.state.user||{};
            user[name] = value;
            this.setState({user, changed: true})
        }
        return <ProfileField value={user[name]} field={field} name={name}
            onChange={onChange}  />
    }
    render(){
        const {err, changed, user} = this.state
        if (!user)
            return <RB.Container>No user</RB.Container>
        const fields = Profile.fields.map(f=>this.field(f))
        return <RB.Container className='menu-container'>
          <ControlBar title={L('interface')} />
          <RB.Row>{err && <ErrorMessage field={err} />}</RB.Row>          
          <RB.Row>
            <RB.Col className='menu-box-clear'>
              <ProfileInfo user={user} />
            </RB.Col>
            <RB.Col>

            </RB.Col>
          </RB.Row>
          <RB.Container className='center'>
            <RB.Row className='justify-content-center'><h3>Профиль</h3></RB.Row>
            {fields}
            {changed && <RB.Row>
                <RB.Col sm={3}></RB.Col>
                <RB.Col sm={3}>
                  <RB.Button onClick={this.submit}>{L('save_change')}</RB.Button>
                </RB.Col>
            </RB.Row>}
          </RB.Container>
        </RB.Container>
    }
}*/
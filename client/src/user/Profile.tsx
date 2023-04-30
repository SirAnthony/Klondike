import React from 'react';
import * as RR from 'react-router-dom'
import * as RB from 'react-bootstrap'
import * as util from '../common/util'
import * as CError from '../common/errors'
import {ErrorMessage} from '../util/errors'
import {User, ProfileFields} from '../common/entity'
import {ControlBar} from '../util/controls'
import * as curls from '../common/urls'
import * as F from '../Fetcher'
import {default as L, LR} from './locale'
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

type UserViewProfileProps = {
    viewer: User
} & UserProfileProps

function ProfileInfo(props: UserViewProfileProps){
    const {user, viewer} = props
    return <RB.Container className='menu-box-desc'>
      <RB.Row><RB.Col>
        <img src={curls.Images.get(user)} alt='user' />
      </RB.Col></RB.Row>
      <RB.Row>
        <RB.Col>{L('desc_name')}</RB.Col>
        <RB.Col>{user.fullName}</RB.Col>
      </RB.Row>
      <RB.Row>
        <RB.Col>{L('desc_role')}</RB.Col>
        <RB.Col>{LR(`user_kind_${user.kind}`)}</RB.Col>
      </RB.Row>
      {(viewer.admin || viewer._id===user._id) && <RB.Row>
        <RB.Col>{L('desc_credit')}</RB.Col>
        <RB.Col>{user.credit|0}</RB.Col>
      </RB.Row>}
    </RB.Container>
}

export function ProfileDataInfo(props: UserViewProfileProps){
    const {user} = props
    const {info} = user
    const txt = info?.replace(/\{([^:]+):([^}]+)\}/g,
        '<a href="/profile/$2">$1</a>')
    return <RB.Col dangerouslySetInnerHTML={({__html: txt})} />
}

function ProfileData(props: UserViewProfileProps){
    return <RB.Container>
      <RB.Row>
        <RB.Col className='menu-list-title'>{L('desc_data')}</RB.Col>
      </RB.Row>
      <RB.Row>
        <ProfileDataInfo {...props} />
      </RB.Row>
    </RB.Container>
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
            <RB.Col className='menu-list-title'>{L('profile')}</RB.Col>
          </RB.Row>
          <RB.Row>
            <RB.Col className='menu-box menu-box-col'>
              <ProfileInfo user={user} viewer={this.props.user} />
            </RB.Col>
            <RB.Col className='menu-box'>
              <ProfileData user={user} viewer={this.props.user} />
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
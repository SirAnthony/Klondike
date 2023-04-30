import React from 'react'
import * as RB from 'react-bootstrap'
import {InstitutionType, User, UserType} from '../common/entity'
import * as util from '../common/util'
import {List as UList} from '../util/controls'
import {ErrorMessage} from '../util/errors'
import {default as L, LR} from './locale'
import {Delimeter} from '../util/components'
import {LoginInput, TextInput, NumberInput, ImageInput} from '../util/inputs'
import {UserTypeSelect, OwnerSelect} from '../util/inputs'
import {ProfileDataInfo} from './Profile'
import {ApiStackError, ClientError} from '../common/errors'
import { DataViewerButtons, EditButtons } from 'src/util/buttons'

type UserSend = Omit<User, 'type' | 'admin' | 'displayName' | 'fullName'
    | 'keys' | 'cost' | 'class'> & {password: string, imgFile: any}

type UserRowProps = {
    user?: User
    viewer?: User
    add?: boolean
    err?: ApiStackError,
    onChange: (u: UserSend)=>Promise<boolean>
    onCancel?: ()=>void
}

function UserRowEdit(props: UserRowProps){
    const {user, onChange} = props
    const [email, setEmail] = React.useState(user?.email)
    const [kind, setKind] = React.useState(user?.kind)
    const [password, setPassword] = React.useState(undefined)
    const [name, setName] = React.useState(user?.name)
    const [first, setFirst] = React.useState(user?.first_name)
    const [last, setLast] = React.useState(user?.last_name)
    const [alias, setAlias] = React.useState(user?.alias)
    const [phone, setPhone] = React.useState(user?.phone)
    const [credit, setCredit] = React.useState(user?.credit)
    const [relation, setRelation] = React.useState(user?.relation)
    const [data, setData] = React.useState(user?.data)
    const [imgFile, setImgFile] = React.useState(undefined)
    // Do not pass img from here, only imgFile
    const onSubmit = ()=>onChange({email, kind, password, name,
        first_name: first, last_name: last, alias, phone, credit,
        relation, data, imgFile})
    return <RB.Row key={`user_edit_${user?._id||'new'}`} className="menu-input-row">
      {props.err && <ErrorMessage field={props.err} />}
      <RB.Form autoComplete='off'>
        <RB.Row className='menu-input-row'>
          <RB.Col sm={3}><LoginInput value={email} onChange={setEmail}
            placeholder={L('field_email')}/></RB.Col>
          <RB.Col><TextInput value={password} onChange={setPassword}
            placeholder={L('field_password')} type='password'/></RB.Col>
          <RB.Col><UserTypeSelect value={kind} onChange={setKind} /></RB.Col>
          <RB.Col><TextInput value={name} onChange={setName}
            placeholder={L('desc_name')} /></RB.Col>
          <RB.Col><TextInput value={phone} onChange={setPhone}
            placeholder={L('field_phone')} /></RB.Col>
          <RB.Col>
            <EditButtons {...props} onSubmit={onSubmit} multiline={true} />
          </RB.Col>
        </RB.Row>
        <RB.Row className='menu-input-row'>
          <RB.Col sm={2}>
            <ImageInput source={user} onChange={setImgFile} />
          </RB.Col>
          <RB.Col>
            <TextInput as='textarea' rows={10} placeholder={L('desc_data')}
              value={data} onChange={setData} />
          </RB.Col>
          <RB.Col sm={4}>
            <RB.Container>
              <RB.Row className='menu-input-row'>
                {L('desc_form_data')}
              </RB.Row>
              <RB.Row className='menu-input-row'>
                <RB.Col><TextInput value={first} onChange={setFirst}
                  placeholder={L('field_first_name')} /></RB.Col>
                <RB.Col><TextInput value={last} onChange={setLast}
                  placeholder={L('field_last_name')} /></RB.Col>
              </RB.Row>
              <RB.Row className='menu-input-row'>
                <RB.Col><TextInput value={alias} onChange={setAlias}
                  placeholder={L('field_alias')} /></RB.Col>
                <RB.Col><NumberInput value={credit} onChange={setCredit}
                  placeholder={L('desc_credit')}/></RB.Col>
              </RB.Row>
              <RB.Row className='menu-input-row'>
                <RB.Col>
                  <OwnerSelect value={relation} onChange={setRelation} exclude={[InstitutionType.User]} />
                </RB.Col>
              </RB.Row>
              <RB.Row className='menu-input-row'>
                {L('desc_form_tooltip')}
              </RB.Row>
            </RB.Container>
          </RB.Col>
        </RB.Row>
      </RB.Form>
    </RB.Row>
}

function UserRow(props: UserRowProps) {
    const {user, viewer} = props
    const [showData, setShowData] = React.useState(false)
    const [showEdit, setShowEdit] = React.useState(false)
    const onChange = async u=>{
        if (!(await props.onChange(u)))
            return false
        setShowEdit(false)
        return true
    }
    if (showEdit)
        return <UserRowEdit {...props} onChange={onChange} onCancel={()=>setShowEdit(false)} />
    const rel = !user.relation ? '-' :
        LR(`institution_type_${user.relation.type}`)+' '+user.relation.name
    return <RB.Row key={`user_${user._id}`} className="menu-list-row">
      <RB.Container>
        <RB.Row>
          <RB.Col><RB.NavLink href={`/profile/${user._id}`}>{user.name}</RB.NavLink></RB.Col>
          <RB.Col>{User.fullName(user)}</RB.Col>
          <RB.Col>{LR(`user_kind_${user.kind}`)}</RB.Col>
          <RB.Col>{rel}</RB.Col>
          <RB.Col>{user.credit}</RB.Col>
          <RB.Col>{user.phone}</RB.Col>
          <DataViewerButtons onEdit={setShowEdit} onShow={setShowData} show={showData} />
        </RB.Row>
        {showData && <RB.Row>
          <ProfileDataInfo user={user} viewer={viewer} />
        </RB.Row>}
      </RB.Container>
    </RB.Row>
}

type UserListState = {
    list?: User[]
    filter_text?: string
    filter_kind?: UserType
    newForm?: UserSend
}
type UserListProps = {
    user: User
}

export function ListNavigator(props: {user: User}){
    const {user} = props
    return <List user={user} />
}

export default class List extends UList<UserListProps, UserListState> {
    L = L
    get closeLink() { return '/admin/' }
    get fetchUrl() { return `/api/users/` }
    get list(){
        const {list, filter_text, filter_kind} = this.state
        const fk = (u: User)=>isNaN(+filter_kind) || +u.kind===+filter_kind
        const ft = (u: User)=>util.isEmpty(filter_text) ||
            [User.fullName(u), u.phone, u.relation?.name].some(v=>
            (new RegExp(filter_text, 'i')).test(v||''))
        return list?.filter(u=>fk(u) && ft(u))||[]
    }
    async onChange(target: string, u: UserSend){
        const {user} = this.props
        this.setState({err: null, newForm: null})
        const empty = user.keys.concat(['password'])
            .filter(k=>!['_id', 'type', 'password', 'info', 'img', 'relation'].includes(k))
            .filter(k=>util.isEmpty(u[k])).join(' ')
        const err = msg=>this.setState({err: new ClientError(msg), newForm: u})
        if (empty)
            return void err(`Missing ${empty}`)
        if (!/^[a-zA-Z0-9_.+-]+$/.test(u.email))
            return void err('Incorrect email format')
        if (u.phone && !util.isPhone(u.phone))
            return void err('Incorrect phone format')
        const ret = await util.wget(`/api/admin/user/${target}`, {
            method: 'POST', data: util.toFormData(u, 'imgFile')})
        if (ret.err)
            return void this.setState({err: ret.err, newForm: u})
        this.fetch()
        return true
    }
    body(){
        const {user} = this.props
        if (!user?.admin)
            return [<ErrorMessage message={this.L('error_restricted')} />]
        const {filter_text, filter_kind, err} = this.state
        const rows = this.list.map(l=><UserRow key={`user_list_${l._id}`} err={err}
            user={l} viewer={user} onChange={u=>this.onChange(`${l._id}/set`, u)} />)
        return [
          <UserRowEdit onChange={u=>this.onChange('add', u)} add={true} err={err}
            user={(this.state.newForm as unknown) as User} />,
          <Delimeter />,
          <RB.Row className='menu-input-row'>
            <RB.Col>{L('desc_filter')}</RB.Col>
            <RB.Col>
              <RB.FormControl placeholder={L('desc_filter_text_placeholder')}
                value={filter_text}
                onChange={({target: {value}})=>this.setState({filter_text:
                  !util.isEmpty(value) ? value : undefined})} />
            </RB.Col>
            <RB.Col>
              <UserTypeSelect value={filter_kind}
                onChange={v=>this.setState({filter_kind: !isNaN(+v) ? v : undefined })} />
            </RB.Col>
          </RB.Row>,
          <RB.Row key={'user_list_title'} className="menu-list-title">
            <RB.Col>{L('desc_name')}</RB.Col>
            <RB.Col>{L('desc_fullname')}</RB.Col>
            <RB.Col>{L('desc_role')}</RB.Col>
            <RB.Col>{L('desc_relation')}</RB.Col>
            <RB.Col>{L('desc_credit')}</RB.Col>
            <RB.Col>{L('desc_phone')}</RB.Col>
            <RB.Col>{L('desc_actions')}</RB.Col>
        </RB.Row>, <Delimeter />, ...rows]
    }
}
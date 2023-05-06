import React from 'react'
import * as RB from 'react-bootstrap'
import {Fine, Owner} from '../common/entity'
import {InstitutionType, User, UserType, UserTypeIn} from '../common/entity'
import {Delimeter} from '../util/components'
import {List as UList} from '../util/controls'
import { DataViewerButtons } from '../util/buttons'
import { ClientError } from '../common/errors'
import { ErrorMessage } from '../util/errors'
import { NumberInput, OwnerSelect, TextInput } from 'src/util/inputs'
import {default as L, LR} from '../inventory/locale'
import * as util from '../common/util'

type FineSend = Omit<Fine, 'ts' | 'filled' | 'name' | 'creditor' | 'type'>

type FineRowNewProps = {
    fine?: Fine
    add?: boolean
    onSubmit: (order: FineSend)=>void
    onCancel?: ()=>void
} & FineRowDescProps
type RowNewState = {
    owner?: Owner
    amount?: number
    data?: string
    err?: ClientError
}
export class FineRowNew extends React.Component<FineRowNewProps, RowNewState> {
    constructor(props){
        super(props)
        this.state = {...props.order};
        ['onCreate'].forEach(r=>this[r] = this[r].bind(this))
    }
    stateChange(obj: any){
        this.setState(Object.assign({err: null}, obj)) }
    onCreate(){
        const {owner, amount, data} = this.state
        if (!owner || isNaN(+amount))
            return this.setState({err: new ClientError('Wrong owner or amount')})
        this.props.onSubmit({_id: this.props.fine?._id, owner, amount, data})
    }
    render(){
        const {state} = this
        const exclude = [InstitutionType.Organization, InstitutionType.Research,
            InstitutionType.Corporation, InstitutionType.Ship]
        const check = state?.owner?._id && !isNaN(+state?.owner?.type) && !isNaN(+state.amount)
        return <RB.Row className='menu-input-row'>
          {state.err && <RB.Row><ErrorMessage field={state.err} /></RB.Row>}
          <RB.Col sm={2}>{LR('desc_fine_new')}</RB.Col>
          <RB.Col sm={4}>
            <OwnerSelect value={state.owner} exclude={exclude}
              onChange={owner=>this.stateChange({owner})} />
          </RB.Col>
          <RB.Col sm={1}>
            <NumberInput placeholder={LR('item_desc_price')} value={state.amount}
              onChange={amount=>this.stateChange({amount})} />
          </RB.Col>
          <RB.Col>
            <TextInput placeholder={LR('item_desc_data')} value={state.data}
              onChange={data=>this.stateChange({data})} />
          </RB.Col>
         <RB.Col>
            <RB.Button disabled={!check} onClick={this.onCreate}>{LR('act_fine')}</RB.Button>
          </RB.Col>
        </RB.Row>
    }
}


type FineRowDescProps = {
    className?: string
}
export function FineRowDesc(props: FineRowDescProps){
    return <RB.Row className='menu-list-title'>
      <RB.Col>{LR('item_desc_target')}</RB.Col>
      <RB.Col>{LR('item_desc_owner')}</RB.Col>
      <RB.Col>{LR('item_desc_price')}</RB.Col>
      <RB.Col>{LR('item_desc_data')}</RB.Col>
      <RB.Col>{LR('item_desc_actions')}</RB.Col>
    </RB.Row>
}

type FineRowProps = {
    fine: Fine
    user?: User
    onReload?: ()=>void
    onSubmit?: (o: FineSend)=>Promise<boolean>
    onDelete?: (o: FineSend)=>void
} & FineRowDescProps
export function FineRow(props: FineRowProps){
    const [showEdit, setShowEdit] = React.useState(false)
    const {fine} = props
    const is_admin = props.user.admin
    const onDelete = ()=>props.onDelete(fine)
    return <RB.Row key={`fine_${fine._id}`} className='menu-list-row'>
        <RB.Col>{fine.creditor.name}</RB.Col>
        <RB.Col>{fine.owner?.name||'-'}</RB.Col>
        <RB.Col>{fine.amount}</RB.Col>
        <RB.Col>{fine.data||'-'}</RB.Col>
        <RB.Col>
          <DataViewerButtons onDelete={onDelete} />
        </RB.Col>
    </RB.Row>
}

type FineListState = {
    list?: Fine[]
}
type FineListProps = {
    user: User
}

export class FineList extends UList<FineListProps, FineListState> {
    L = L
    get title(){ return 'fines_listing' }
    get fetchUrl() { return `/api/user/fines` }
    get rowNew(){ 
        return <FineRowNew {...this.props} onSubmit={fine=>this.onPut(fine)} /> }
    get mapView(){ return null }
    getRow(fine: Fine){
        return <FineRow key={`fine_row_${fine._id}`} fine={fine} {...this.props}
             onSubmit={f=>this.onPut(f)} onDelete={f=>this.onDelist(f)} />
    }
    async onAction(item: FineSend, action: string, data) : Promise<boolean> {
        const {user} = this.props
        if (!UserTypeIn(user, UserType.GuardFine | UserType.Master))
            return false
        const res = await util.wget(`/api/user/fine/${item._id||0}/${action}`,
            {method: 'PUT', ...data})
        if (res.err)
            return void this.setState({err: res.err})
        this.fetch()
        return true
    }
    async onDelist(item: FineSend) : Promise<boolean> {
        return await this.onAction(item, 'cancel', {method: 'DELETE'})
    }
    async onPut(item: FineSend) : Promise<boolean> {
        return await this.onAction(item, 'put', {method: 'PUT', data: {data: item}})
    }
    body(){
        const {list} = this.state as FineListState
        const rows = list.filter(fine=>!fine.filled).map(l=>this.getRow(l))
        return [this.rowNew, <FineRowDesc />, <Delimeter />, ...rows]
    }
}

export function ListNavigator(props: {user: User}){
    const {user} = props
    return <FineList user={user} />
}

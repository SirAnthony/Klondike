import React from 'react'
import * as RB from 'react-bootstrap'
import {Owner, Order, ResourceCost, User, InstitutionType} from '../common/entity'
import {OwnerSelect, NumberInput, MultiResourceCostSelect, RandomID, ResourceCostID} from '../util/inputs'
import {default as L, LR} from './locale'
import {ClientError} from '../common/errors'
import {ErrorMessage} from '../util/errors'
import * as _ from 'lodash'
import {DataViewerButtons, EditButtons} from '../util/buttons'

export type OrderSend = Omit<Order, 'name' | 'plan' | 'keys' | 'class'>

type RowDescProps = {
    className?: string
}
export function OrderRowDesc(props: RowDescProps){
    return <RB.Row className={props.className}>
      <RB.Col>{LR('res_desc_kind')}</RB.Col>
      <RB.Col>{L('res_required')}</RB.Col>
      <RB.Col>{L('res_filled')}</RB.Col>
      <RB.Col sm={1}>{LR('cycle')}</RB.Col>
      <RB.Col sm={2}>{LR('assignee')}</RB.Col>
      <RB.Col sm={2}>{LR('item_desc_actions')}</RB.Col>
    </RB.Row>
}

type RowProps = {
    order: Order
    user?: User
    onReload?: ()=>void
    onSubmit?: (o: OrderSend)=>Promise<boolean>
    onDelete?: (o: Order)=>void
} & RowDescProps
export function OrderRow(props: RowProps){
    const [showEdit, setShowEdit] = React.useState(false)
    const {order} = props
    let reqs = order.resourceCost?.map((r, i)=>
      <RB.Row key={`order_req_${order._id}_${i}`}>
        <RB.Col>{LR(`res_kind_${r.kind}`)}</RB.Col>
        <RB.Col>{r.value}</RB.Col>
        <RB.Col>{r.provided}</RB.Col>
      </RB.Row>)
    const is_admin = props.user.admin
    if (is_admin && showEdit){
        return <OrderRowNew {...props} onSubmit={async obj=>{
          (await props.onSubmit(obj)) && setShowEdit(false)
        }} onCancel={()=>setShowEdit(false)} />
    }
    const onDelete = is_admin ? ()=>props.onDelete(order) : null
    return <RB.Row key={`order_${order._id}`} className={props.className}>
        <RB.Col><RB.Container>{reqs}</RB.Container></RB.Col>
        <RB.Col sm={1}>{order.cycle}</RB.Col>
        <RB.Col sm={2}>{order.assignee?.name}</RB.Col>
        <RB.Col sm={2}>
          {is_admin && <DataViewerButtons onEdit={setShowEdit} onDelete={onDelete} />}
        </RB.Col>
    </RB.Row>
}

function OrderReq(req: ResourceCost, _id) {
    if (!req)
        return [null]
    return [
      <RB.Col sm={4} key={`order_req_kind_${_id}`}>{LR(`res_kind_${req.kind}`)}</RB.Col>,
      <RB.Col sm={1} key={`order_req_required_${_id}`}>{req.value}</RB.Col>,
      <RB.Col sm={1} key={`order_req_filled_${_id}`}>{req.provided||0}</RB.Col>
    ]
}
export function OrderRowCompact(props: RowProps){
    const {order} = props, {resourceCost} = order, rows = [];
    for (let i=0; i<resourceCost.length; i+=2){
        rows.push([...OrderReq(resourceCost[i], order._id+i),
            ...OrderReq(resourceCost[i+1], order._id+(i+1))])
    }
    return <RB.Row key={`order_row_${order._id}`}>{rows}</RB.Row>
}

type RowNewProps = {
    order?: Order
    add?: boolean
    onSubmit: (order: OrderSend)=>void
    onCancel?: ()=>void
} & RowDescProps
type RowNewState = {
    assignee?: Owner
    cycle: number
    resourceCost: ResourceCostID[]
    err?: ClientError
}
export class OrderRowNew extends React.Component<RowNewProps, RowNewState> {
    constructor(props){
        super(props)
        this.state = {...props.order};
        ['onCreate', 'addRow'].forEach(r=>this[r] = this[r].bind(this))
    }
    stateChange(obj: any){
        this.setState(Object.assign({err: null}, obj)) }
    onCreate(){
        const {assignee, cycle, resourceCost} = this.state
        if (!assignee || isNaN(+cycle))
            return this.setState({err: new ClientError('Wrong owner or cycle')})
        if (!resourceCost?.length)
            return this.setState({err: new ClientError('Empty request')})
        if (_.uniqBy(resourceCost, f=>+f.kind).length != resourceCost.length)
            return this.setState({err: new ClientError('Same resource added multiple times')})
        if (resourceCost.find(r=>isNaN(+r.kind)||!r.value))
            return this.setState({err: new ClientError('Incorrect parameters')})
        const costs = resourceCost.map(r=>({kind: r.kind, value: r.value, provided: r.provided|0}))
        this.props.onSubmit({_id: this.props.order?._id,
            assignee, cycle, resourceCost: costs})
    }
    addRow(){
        this.stateChange({resourceCost: [].concat(this.state.resourceCost||[],
            {_id: RandomID()})})
    }
    render(){
        const {state} = this
        const exclude = [InstitutionType.Organization, InstitutionType.Research,
            InstitutionType.Ship, InstitutionType.User]
        return <RB.Row className='menu-list-row'><RB.Col><RB.InputGroup>
          <RB.Row className='menu-input-row'>
            {state.err && <RB.Row><ErrorMessage field={state.err} /></RB.Row>}
            <RB.Col>{L('act_order_create')}</RB.Col>
            <RB.Col>
              <OwnerSelect value={state.assignee} exclude={exclude}
                onChange={assignee=>this.stateChange({assignee})} />
            </RB.Col>
            <RB.Col sm={1}>{LR('cycle')}</RB.Col>
            <RB.Col>
              <NumberInput placeholder={LR('cycle')} value={state.cycle}
                onChange={cycle=>this.stateChange({cycle})} />
            </RB.Col>
            <RB.Col>
              <RB.Button onClick={this.addRow}>{L('act_add_row')}</RB.Button>
            </RB.Col>
            <RB.Col>
              <EditButtons add={this.props.add} disabled={!!state.err}
                onSubmit={this.onCreate} onCancel={this.props.onCancel} />
            </RB.Col>
          </RB.Row>
        </RB.InputGroup>
        <MultiResourceCostSelect value={state.resourceCost}
          onChange={resourceCost=>this.stateChange({resourceCost})} />
        </RB.Col></RB.Row>
    }
}

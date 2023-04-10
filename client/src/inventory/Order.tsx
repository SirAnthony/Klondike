import React from 'react'
import * as RB from 'react-bootstrap'
import {Owner, Order, ResourceType, User, InstitutionType} from '../common/entity'
import {ResourceSelect, OwnerSelect, NumberInput} from '../util/inputs'
import * as util from '../common/util'
import {default as L, LR} from './locale'
import * as _ from 'lodash'
import {ClientError} from '../common/errors'
import {ErrorMessage} from '../util/errors'

type RowDescProps = {
    className?: string
}
export function OrderRowDesc(props: RowDescProps){
    return <RB.Row className={props.className}>
      <RB.Col>{LR('res_desc_kind')}</RB.Col>
      <RB.Col>{LR('res_required')}</RB.Col>
      <RB.Col>{LR('res_filled')}</RB.Col>
      <RB.Col sm={1}>{LR('cycle')}</RB.Col>
      <RB.Col sm={2}>{LR('assignee')}</RB.Col>
      <RB.Col sm={2}>{LR('item_desc_actions')}</RB.Col>
    </RB.Row>
}

type RowProps = {
    order: Order
    user?: User
    onReload?: ()=>void
    onDelete?: (o: Order)=>void
} & RowDescProps
export function OrderRow(props: RowProps){
    const {order} = props
    let reqs = order.requests.map((r, i)=>
      <RB.Row key={`order_req_${order._id}_${i}`}>
        <RB.Col>{LR(`res_kind_${r.kind}`)}</RB.Col>
        <RB.Col>{r.required}</RB.Col>
        <RB.Col>{r.filled}</RB.Col>
      </RB.Row>)
    const is_admin = props.user.admin
    const onClick = ()=>props.onDelete(order)
    return <RB.Row key={`order_${order._id}`} className={props.className}>
        <RB.Col><RB.Container>{reqs}</RB.Container></RB.Col>
        <RB.Col sm={1}>{order.cycle}</RB.Col>
        <RB.Col sm={2}>{order.assignee.name}</RB.Col>
        <RB.Col sm={2}>
          {is_admin && <RB.Button onClick={onClick}>{L('act_delete')}</RB.Button>}
        </RB.Col>
    </RB.Row>
}

function OrderReq(req: ResourceRow, _id) {
    if (!req)
        return [null]
    return [
      <RB.Col sm={4} key={`order_req_kind_${_id}`}>{LR(`res_kind_${req.kind}`)}</RB.Col>,
      <RB.Col sm={1} key={`order_req_required_${_id}`}>{req.required}</RB.Col>,
      <RB.Col sm={1} key={`order_req_filled_${_id}`}>{req.filled||0}</RB.Col>
    ]
}
export function OrderRowCompact(props: RowProps){
    const {order} = props, {requests} = order, rows = [];
    for (let i=0; i<requests.length; i+=2)
        rows.push([...OrderReq(requests[i], order._id+i), ...OrderReq(requests[i+1], order._id+(i+1))])
    return <RB.Row key={`order_row_${order._id}`}>{rows}</RB.Row>
}

type RowNewProps = {
    onCreate: (order: Order)=>void
} & RowDescProps
type ResourceRow = {
    kind: ResourceType,
    required?: number,
    filled?: number
}
type ResourceRowID = ResourceRow & {_id: number}
type RowNewState = {
    assignee?: Owner
    cycle: number
    rows: ResourceRowID[]
    err?: ClientError
}
export class OrderRowNew extends React.Component<RowNewProps, RowNewState> {
    constructor(props){
        super(props)
        this.state = {assignee: null, cycle: 0, rows: []};
        ['onCreate', 'addRow', 'deleteRow'].forEach(
            r=>this[r] = this[r].bind(this))
    }
    stateChange(obj: any){
        this.setState(Object.assign({err: null}, obj)) }
    onCreate(){
        const {assignee, cycle, rows} = this.state
        if (!assignee)
            return this.setState({err: new ClientError('Wrong owner')})
        if (!rows.length)
            return this.setState({err: new ClientError('Empty request')})
        if (rows.find(r=>r.kind<0||!r.required))
            return this.setState({err: new ClientError('Incorrect parameters')})
        const order = new Order()
        order.assignee = assignee
        order.cycle = cycle
        order.requests = rows.map(r=>({kind: r.kind,
            required: r.required, filled: r.filled}))
        this.props.onCreate(order)
    }
    addRow(){
        const rows = this.state.rows.map(r=>Object.assign({}, r))
        const _id = rows.reduce((p, r)=>r._id<p ? p : r._id, -1)+1
        rows.push({_id, kind: null})
        this.stateChange({rows})
    }
    changeRow(row: any){
        const rows = this.state.rows.map(r=>Object.assign({}, r))
        Object.assign(rows.find(r=>r._id==row._id), row)
        this.stateChange({rows})
    }
    deleteRow(id: number){
        const rows = this.state.rows.filter(r=>r._id!=id)
            .map(r=>Object.assign({}, r))
        this.stateChange({rows})
    }
    row(row: ResourceRowID){
        const changeRow = (key, val)=>this.changeRow({_id: row._id, [key]: +val})
        return <RB.Row key={`order_row_${row._id}`} className='menu-input-row'>
          <RB.Col sm={2}>
            <ResourceSelect value={row.kind} onChange={type=>changeRow('kind', +type)} />
          </RB.Col>
          <RB.Col sm={2}>
            <NumberInput placeholder={L('amount_required')} value={row.required}
                onChange={val=>changeRow('required', val)} />
          </RB.Col>
          <RB.Col sm={2}>
            <NumberInput placeholder={L('amount_filled')} value={row.filled}
                onChange={val=>changeRow('filled', val)} />
          </RB.Col>
          <RB.Col sm={2}>
            <RB.Button onClick={()=>this.deleteRow(row._id)}>{L('act_delete')}</RB.Button>
          </RB.Col>
        </RB.Row>
    }
    render(){
        const {props} = this, {state} = this
        const rows = state.rows.map(r=>this.row(r))
        const exclude = [InstitutionType.Organization, InstitutionType.Research,
            InstitutionType.Ship, InstitutionType.User]
        return <RB.Row><RB.Col><RB.InputGroup>
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
              <RB.Button onClick={this.onCreate}>{L('act_create')}</RB.Button>
            </RB.Col>
          </RB.Row>
          {rows}
        </RB.InputGroup></RB.Col></RB.Row>
    }
}

import React from 'react'
import * as RB from 'react-bootstrap'
import {Order, ResourceType, User} from '../common/entity'
import {Select as CSelect} from '../corp/List'
import {ResourceSelect} from './Item'
import * as util from '../common/util'
import L from '../common/locale'
import * as _ from 'lodash'
import {ClientError} from '../common/errors'
import {ErrorMessage} from './errors'

type RowDescProps = {
    className?: string
}
export function OrderRowDesc(props: RowDescProps){
    return <RB.Row className={props.className}>
      <RB.Col>{L('res_desc_kind')}</RB.Col>
      <RB.Col>{L('res_required')}</RB.Col>
      <RB.Col>{L('res_filled')}</RB.Col>
      <RB.Col sm={1}>{L('cycle')}</RB.Col>
      <RB.Col sm={2}>{L('assignee')}</RB.Col>
      <RB.Col sm={2}>{L('item_desc_actions')}</RB.Col>
    </RB.Row>
}

type RowProps = {
    order: Order
    onReload?: ()=>void
} & RowDescProps
export function OrderRow(props: RowProps){
    const {order} = props
    let reqs = order.requests.map((r, i)=>
      <RB.Row key={`order_req_${order._id}_${i}`}>
        <RB.Col>{L(`res_kind_${r.kind}`)}</RB.Col>
        <RB.Col>{r.required}</RB.Col>
        <RB.Col>{r.filled}</RB.Col>
      </RB.Row>)
    return <RB.Row key={`order_${order._id}`} className={props.className}>
        <RB.Col><RB.Container>{reqs}</RB.Container></RB.Col>
        <RB.Col sm={1}>{order.cycle}</RB.Col>
        <RB.Col sm={2}>{order.assignee.name}</RB.Col>
        <RB.Col sm={2}>actions</RB.Col>
    </RB.Row>
}

function OrderReq(req: ResourceRow) {
    return [
      <RB.Col sm={4}>{L(`res_kind_${req.kind}`)}</RB.Col>,
      <RB.Col sm={1}>{req.required}</RB.Col>,
      <RB.Col sm={1}>{req.filled||0}</RB.Col>
    ]
}
export function OrderRowCompact(props: RowProps){
    const {order} = props, {requests} = order, rows = [];
    for (let i=0; i<requests.length; i+=2)
        rows.push([...OrderReq(requests[i]), ...OrderReq(requests[i+1])])
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
    assignee: string
    cycle: number
    rows: ResourceRowID[]
    err?: ClientError
}
export class OrderRowNew extends React.Component<RowNewProps, RowNewState> {
    constructor(props){
        super(props)
        this.state = {assignee: '', cycle: 0, rows: []};
        ['onCreate', 'addRow', 'deleteRow'].forEach(
            r=>this[r] = this[r].bind(this))
    }
    onCreate(){
        const {assignee, cycle, rows} = this.state
        if (!assignee)
            return this.setState({err: new ClientError('Wrong owner')})
        if (!rows.length)
            return this.setState({err: new ClientError('Empty request')})
        if (rows.find(r=>r.kind<0||!r.required))
            return this.setState({err: new ClientError('Incorrect parameters')})
        const order = new Order()
        order.assignee = {_id: assignee, name: ''}
        order.cycle = cycle
        order.requests = rows.map(r=>({kind: r.kind,
            required: r.required, filled: r.filled}))
        this.props.onCreate(order)
    }
    addRow(){
        const rows = this.state.rows.map(r=>Object.assign({}, r))
        const _id = rows.reduce((p, r)=>r._id<p ? p : r._id, -1)+1
        rows.push({_id, kind: -1})
        this.setState({rows, err: null})
    }
    changeRow(row: any){
        const rows = this.state.rows.map(r=>Object.assign({}, r))
        Object.assign(rows.find(r=>r._id==row._id), row)
        this.setState({rows, err: null})
    }
    deleteRow(id: number){
        const rows = this.state.rows.filter(r=>r._id!=id)
            .map(r=>Object.assign({}, r))
        this.setState({rows, err: null})
    }
    row(row: ResourceRowID){
        const changeRow = (key, val)=>this.changeRow({_id: row._id, [key]: +val})
        const onChange = key=>({target: {value}})=>changeRow(key, +value)
        return <RB.Row key={`order_row_${row._id}`}>
          <RB.Col>
            <ResourceSelect value={row.kind}
                onChange={type=>changeRow('kind', +type)} />
          </RB.Col>
          <RB.Col>
            <RB.FormControl placeholder={L('res_required')} value={row.required}
                onChange={onChange('required')} />
          </RB.Col>
          <RB.Col>
            <RB.FormControl placeholder={L('res_filled')} value={row.filled}
                onChange={onChange('filled')} />
          </RB.Col>
          <RB.Col>
            <RB.Button onClick={()=>this.deleteRow(row._id)}>{L('act_delete')}</RB.Button>
          </RB.Col>
        </RB.Row>
    }
    render(){
        const {props} = this, {state} = this
        const rows = state.rows.map(r=>this.row(r))
        return <RB.Row><RB.Col><RB.InputGroup>
          <RB.Row className={props.className}>
            {state.err && <RB.Row><ErrorMessage field={state.err} /></RB.Row>}
            <RB.Col>{L('order_create')}</RB.Col>
            <RB.Col>
              <CSelect value={state.assignee} optName='item_desc_owner'
                onChange={assignee=>this.setState({assignee, err: null})} />
            </RB.Col>
            <RB.Col sm={1}>{L('cycle')}</RB.Col>
            <RB.Col>
              <RB.FormControl placeholder={L('cycle')} value={state.cycle}
                onChange={({target: {value}})=>this.setState({cycle: +value})} />
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
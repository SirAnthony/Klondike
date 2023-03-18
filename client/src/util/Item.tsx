import React from 'react'
import * as RB from 'react-bootstrap'
import {Item as EItem, MarketType, Resource, User} from '../common/entity'
import {ResourceType} from '../common/entity'
import * as util from '../common/util'
import L from '../common/locale'

const column_layout = (fields = [])=>{
    const MAX_SUM = 12
    const res: any = {id: 1, name: 1, type: 1, value: 1, price: 1, actions: 2}
    let prio = 'data location owner id name type kind'.split(' ')
    fields.forEach(f=>res[f]=1)
    let free = MAX_SUM - Object.keys(res).reduce((p, v)=>p+res[v], 0)
    for (let i = free; i>0; --i)
        res[prio.shift()] += 1
    return res
}

type ItemRowProps = {
    className?: string
    user: User
    fields?: string[]
}

type ItemProps = {
    item: EItem
    layout?: number
    onReload: ()=>void
} & ItemRowProps

export function ItemRowDesc(props: ItemRowProps){
    const has = n=>props.fields?.includes(n)
    const lyt = column_layout(props.fields)
    return <RB.Row className={props.className}>
      <RB.Col sm={lyt.id}>{L('item_desc_id')}</RB.Col>
      <RB.Col sm={lyt.name}>{L('item_desc_name')}</RB.Col>
      <RB.Col sm={lyt.type}>{L('item_desc_type')}</RB.Col>
      {has('kind') && <RB.Col sm={lyt.kind}>{L('res_desc_kind')}</RB.Col>}
      {has('owner') && <RB.Col sm={lyt.owner}>{L('item_desc_owner')}</RB.Col>}
      {has('location') && <RB.Col sm={lyt.location}>{L('item_desc_location')}</RB.Col>}
      <RB.Col sm={lyt.value}>{L('res_desc_value')}</RB.Col>
      <RB.Col sm={lyt.price}>{L('item_desc_price')}</RB.Col>
      {has('data') && <RB.Col sm={lyt.data}>{L('item_desc_data')}</RB.Col>}
      <RB.Col sm={lyt.actions}>{L('item_desc_actions')}</RB.Col>
    </RB.Row>
}

type ItemState = {

}
class ItemActions extends React.Component<ItemProps, ItemState> {
    constructor(props){
        super(props);
        ['sell', 'delete'].forEach(cmd=>
            this[`do_${cmd}`] = this[`do_${cmd}`].bind(this))
    }
    get is_admin(){ return this.props.user.admin }
    get is_owner(){
        const {user, item} = this.props
        return user && item && user._id == item.owner?._id
    }
    async do_delist(){
        const {item} = this.props
        if (!this.is_owner || !item?._id || item.market?.type != MarketType.Sale)
            return
        await util.wget(`/api/corp/item/delist/${item._id}`, {method: 'PUT'})
        this.props.onReload()
    }
    async do_sell(){
        const {item} = this.props
        if (!this.is_owner || !item?._id || item.market?.type != MarketType.None)
            return
        await util.wget(`/api/corp/item/sell/${item._id}`, {method: 'PUT'})
        this.props.onReload()
    }
    async do_delete(){
        const {props} = this
        if (!this.is_admin || !props.item?._id)
            return
        await util.wget(`/api/admin/item/delete/${props.item._id}`, {method: 'DELETE'})
        this.props.onReload()
    }
    btn_sell(){
        const {item} = this.props
        if (!this.is_owner || item.market?.type==MarketType.Protected)
            return null
        if (item.market?.type!=MarketType.Sale)
            return <RB.Button onClick={this.do_sell}>{L('act_sell')}</RB.Button>
        return [
            <span>{L('market_code')}</span>,
            <span>{item.market?.code}</span>,
            <RB.Button onClick={this.do_delist}>{L('act_delist')}</RB.Button>
        ]
    }
    btn_delete(){
        if (!this.is_admin)
            return null
        return <RB.Button onClick={this.do_delete}>{L('act_delete')}</RB.Button>
    }
    render() {
        if (!this.props.item)
            return null
        return <RB.Col sm={this.props.layout}>
          {this.btn_sell()}
          {this.btn_delete()}
        </RB.Col>
    }
}

function Location(props: ItemProps) {
    const {location} = props.item
    if (!location)
        return null
    return <RB.Col sm={props.layout}>
      <span>{location.system}</span>
      <span>{location.name}</span>
      <span>{location.pos.col}:{location.pos.row}</span>
    </RB.Col>
}

export function ItemRow(props: ItemProps){
    const {item, user} = props
    const res = item as Resource
    const has = n=>props.fields?.includes(n)
    const lyt = column_layout(props.fields)
    return <RB.Row className={props.className}>
      <RB.Col className='wrap-anywhere' sm={lyt.id}>{item._id}</RB.Col>
      <RB.Col sm={lyt.name}>{item.name}</RB.Col>
      <RB.Col sm={lyt.type}>{L(`item_type_${item.type}`)}</RB.Col>
      {has('kind') && <RB.Col sm={lyt.kind}>
        {res.kind!=undefined ? L(`res_kind_${res.kind}`) : '-'}</RB.Col>}
      {has('owner') && <RB.Col sm={lyt.owner}>
        {item.owner ? item.owner.name : '-'}</RB.Col>}
      {has('location') && <Location {...props} layout={lyt.location} />}
      <RB.Col sm={lyt.value}>{res.value || 1}</RB.Col>
      <RB.Col sm={lyt.price}>{item.price}</RB.Col>
      {has('data') && <RB.Col sm={lyt.data}>{res.data}</RB.Col>}
      <ItemActions {...props} layout={lyt.actions} />
    </RB.Row>
}

export function ResourceSelect(props: {value: number, onChange: (type: ResourceType)=>void}){
    const [kind, setKind] = React.useState(props.value)
    const options = Object.keys(ResourceType).filter(k=>!isNaN(+k)).map(k=>
        <option key={`kind_${k}`}  value={+k}>{L(`res_kind_${k}`)}</option>)
    const onChange = ({target: {value}})=>{
        setKind(+value)
        props.onChange(+value)
    }
    return <RB.FormSelect value={kind} onChange={onChange}>
      <option key='res_type_none' value={-1} disabled={true}>
        {L('res_desc_kind')}
      </option>
      {options}
    </RB.FormSelect>
}


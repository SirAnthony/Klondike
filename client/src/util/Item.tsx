import React from 'react'
import * as RB from 'react-bootstrap'
import {Item, ItemType, MarketType, User} from '../common/entity'
import {ID, Location} from '../common/entity'
import {Resource, ResourceType} from '../common/entity'
import {ResourceSelect, TypeSelect, PatentTypeSelect, PatentWeightSelect, ArtifactTypeSelect} from './inputs'
import {NumberInput, LocationSelect, OwnerSelect} from './inputs'
import {MultiOwnerSelect, MultiResourceSelect} from './inputs'
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
    item: Item
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

function LocationCol(props: ItemProps) {
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
      {has('location') && <LocationCol {...props} layout={lyt.location} />}
      <RB.Col sm={lyt.value}>{res.value || 1}</RB.Col>
      <RB.Col sm={lyt.price}>{item.price}</RB.Col>
      {has('data') && <RB.Col sm={lyt.data}>{res.data}</RB.Col>}
      <ItemActions {...props} layout={lyt.actions} />
    </RB.Row>
}



type ItemRowNewProps = {
    onCreate: (item: Item)=>void
}
type ItemRowNewState = {
    type?: ItemType
    owner?: ID
    location?: Location
    price?: number
    kind?: number
    value?: number
    data?: string
    mass?: number
    weight?: number
    energy?: number
    target?: Location
    resourceCost?: {kind: ResourceType, value: number}[]
    boosts?: {kind: string, value: number}[]
    owners?: ID[]    
}
export class ItemRowNew extends React.Component<ItemRowNewProps, ItemRowNewState> {
    constructor(props){
        super(props)
        this.state = {}
    }
    create() {
        const item = new (Item.class(this.state.type))()
        for (let k of item.keys)
            item[k] = this.state[k]
        this.props.onCreate(item)
    }
    get row_size(){
        return 2
    }
    hasField(name: string){
        return (new (Item.class(this.state.type))()).keys.includes(name) }
    // resource
    fields_0(){
        const row_size = this.row_size
        const {kind, value} = this.state
        const kindChange = kind=>this.setState({kind})
        const valChange = value=>this.setState({value})
        return [<RB.Col sm={row_size} key='resource_kind_select'>
          <ResourceSelect value={kind} onChange={kindChange} />
        </RB.Col>,
        <RB.Col sm={row_size} key='resource_value_select'>
          <NumberInput placeholder={L('res_desc_value')} value={value} onChange={valChange} />
        </RB.Col>]
    }
    // coordinates
    fields_1(){
        const {target} = this.state
        const targetChange = target=>this.setState({target})
        return [<RB.Col sm={4} key='coord_target_select'>
          <LocationSelect onChange={targetChange} value={target} optName='item_desc_target' />
        </RB.Col>]
    }
    // ship
    fields_2(){
        throw new Error('cannot create ships')
    }
    // module
    fields_3(){
        const row_size = this.row_size
        const {mass, energy} = this.state
        const massChange = mas=>this.setState({mass})
        const energyChange = energy=>this.setState({energy})
        return [<RB.Col sm={row_size} key='module_mass_input'>
          <NumberInput placeholder={L('item_desc_mass')} value={mass} onChange={massChange} />
        </RB.Col>, <RB.Col sm={row_size} key='module_energy_input'>
          <NumberInput placeholder={L('item_desc_energy')} value={energy} onChange={energyChange} />
        </RB.Col>]
    }
    // patent
    fields_4(){
        const row_size = this.row_size
        const {kind, weight} = this.state
        const kindChange = kind=>this.setState({kind})
        const weightChange = weight=>this.setState({weight})
        return [<RB.Col sm={row_size} key='patent_type_select'>
          <PatentTypeSelect value={kind} onChange={kindChange} />
        </RB.Col>,
        <RB.Col sm={row_size} key='patent_weight_select'>
          <PatentWeightSelect value={weight} onChange={weightChange} />
        </RB.Col>]
    }
    rows_4(){
        const {owners, resourceCost} = this.state
        const ownersChange = owners=>this.setState({owners})
        const resChange = resourceCost=>this.setState({resourceCost})
        return [
          <MultiOwnerSelect value={owners} onChange={ownersChange}
            className='menu-list-row' key='multi_owner_select' />,
          <MultiResourceSelect value={resourceCost} onChange={resChange}
            className='menu-list-row' key='multi_resource_select' />
        ]
    }
    // artifact
    fields_5(){
        const row_size = this.row_size
        const {kind} = this.state
        const kindChange = kind=>this.setState({kind})
        return [<RB.Col sm={row_size} key='artifact_kind_select'>
          <ArtifactTypeSelect value={kind} onChange={kindChange} />
        </RB.Col>]
    }
    fields_top(){
        const {type, price} = this.state
        const row_size = this.row_size, fkey = `fields_${type}`
        const top_fields = this[fkey] ? this[fkey]() : []
        const typeChange = type=>this.setState({type})
        const priceChange = price=>this.setState({price})
        return <RB.Row className='menu-list-row'>
          <RB.Col sm={row_size}>{L('act_item_create')}</RB.Col>
          <RB.Col sm={row_size}>
            <TypeSelect value={type} onChange={typeChange} exclude={[ItemType.Ship]}/>
          </RB.Col>
          {top_fields}
         <RB.Col sm={row_size}>
            <NumberInput placeholder={L('item_desc_price')} value={price} onChange={priceChange} />
          </RB.Col>
          <RB.Col sm={row_size}>
            <RB.Button onClick={()=>this.create()}>{L('act_create')}</RB.Button>
          </RB.Col>
        </RB.Row>
    }
    fields_bottom(){
        const {type, data, owner, location} = this.state
        const fkey = `fields_${type}_b`, btm_fields = this[fkey] ? this[fkey]() : []
        const dataChange = ({target: {value}})=>this.setState({data: value})
        const ownerChange = owner=>this.setState({owner})
        const locChange = location=>this.setState({location})
        return <RB.Row className='menu-list-row'>
          <RB.Col sm={4}>
            <RB.FormControl as='textarea' rows={3} placeholder={L('item_desc_data')}
              value={data} onChange={dataChange} />
          </RB.Col>
          {this.hasField('owner') && <RB.Col sm={2}>
            <OwnerSelect value={owner} onChange={ownerChange} />
          </RB.Col>}
          {this.hasField('location') && <RB.Col sm={4}>
            <LocationSelect onChange={locChange} value={location} />
          </RB.Col>}
          {btm_fields}
        </RB.Row>
    }
    render(){
        const row_size = this.row_size
        const {type} = this.state
        const fkey = `rows_${type}`, rows = this[fkey] ? this[fkey]() : []
        return <RB.InputGroup>
          {this.fields_top()}
          {this.fields_bottom()}
          {rows}
        </RB.InputGroup>
    }
}


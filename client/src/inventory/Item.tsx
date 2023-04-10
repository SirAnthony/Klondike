import React from 'react'
import * as RB from 'react-bootstrap'
import {Corporation, Item, ItemType, MarketType, User} from '../common/entity'
import {Owner, Location, InstitutionType} from '../common/entity'
import {Resource, ResourceType, Patent} from '../common/entity'
import {ResourceSelect, TypeSelect, PatentTypeSelect} from '../util/inputs'
import {PatentWeightSelect, ArtifactTypeSelect} from '../util/inputs'
import {NumberInput, LocationSelect, OwnerSelect} from '../util/inputs'
import {MultiOwnerSelect, MultiResourceSelect} from '../util/inputs'
import {OwnerValueSelectTrigger, PatentSelectTrigger} from '../util/popovers'
import {IDField} from '../util/components'
import {ApiError, FormError} from '../common/errors'
import {default as L, LR} from './locale'

const column_layout = (fields = [])=>{
    const MAX_SUM = 12
    const res: any = Object.assign({id: 1, name: 1, type: 1, value: 1,
        location: 1, price: 1, data: 1, owner: 1, actions: 1},
        fields.reduce((p, c)=>{ p[c]=1; return p }, {}))
    let prio = 'actions data location owner id name type kind'.split(' ')
    fields.forEach(f=>res[f]=1)
    let free = MAX_SUM - Object.keys(res).reduce((p, v)=>p+res[v], 0)
    for (let i = free; i>0; --i)
        res[prio.shift()] += 1
    return res
}

const owners_exclude = (type: ItemType)=>{
    switch(type){
        case ItemType.Resource: return [InstitutionType.User]
        case ItemType.Coordinates: return [InstitutionType.User]
        case ItemType.Module: return [InstitutionType.User]
        case ItemType.Patent: return [InstitutionType.User, InstitutionType.Ship,
            InstitutionType.Research, InstitutionType.Organization]
        case ItemType.Artifact: return []
    }
    return []
}

function PopupButton(props: {url: string, desc: string, opt?: any}){
    const opt = Object.assign({width: 500, height: 500, scrollbar: 'no', resizable: 'no'}, props.opt)
    const onClick = ()=>{
        const opt_str = Object.keys(opt).map(c=>`${c}=${opt[c]}`).join(',')
        window.open(props.url, 'popup', opt_str)
        return false
    }
    return <RB.Button onClick={onClick}>{props.desc}</RB.Button>

}

type ItemRowProps = {
    className?: string
    user: User
    fields?: string[]
}

export function ItemRowDesc(props: ItemRowProps){
    const has = n=>props.fields?.includes(n)
    const lyt = column_layout(props.fields)
    return <RB.Row className={props.className}>
      <RB.Col sm={lyt.id}>{LR('item_desc_id')}</RB.Col>
      <RB.Col sm={lyt.name}>{LR('item_desc_name')}</RB.Col>
      <RB.Col sm={lyt.type}>{LR('item_desc_type')}</RB.Col>
      <RB.Col sm={lyt.kind}>{LR('res_desc_kind')}</RB.Col>
      <RB.Col sm={lyt.owner}>{LR('item_desc_owner')}</RB.Col>
      <RB.Col sm={lyt.location}>{LR('item_desc_location')}</RB.Col>
      <RB.Col sm={lyt.value}>{LR('res_desc_value')}</RB.Col>
      <RB.Col sm={lyt.price}>{LR('item_desc_price')}</RB.Col>
      <RB.Col sm={lyt.data}>{LR('item_desc_data')}</RB.Col>
      <RB.Col sm={lyt.actions}>{LR('item_desc_actions')}</RB.Col>
    </RB.Row>
}

type ItemProps = {
    item: Item
    corp?: Corporation 
    layout?: number
    onDelete?: (item: Item)=>void
    onPay?: (item: Item, patent: Patent)=>void
    onSell?: (item: Item, target: Owner, price: number)=>void
    onDelist?: (item: Item)=>void
} & ItemRowProps

type ItemState = {
    err?: ApiError
    patent?: Patent
}
class ItemActions extends React.Component<ItemProps, ItemState> {
    constructor(props){
        super(props);
    }
    get is_admin(){ return this.props.user.admin }
    get is_owner(){
        const {user, item} = this.props
        return user && item && user._id == item.owner?._id
    }
    btn_pay(){
        const {item, corp, onPay} = this.props
        if (!onPay || !this.is_admin && !(this.is_owner && corp.type==InstitutionType.Research))
            return null
        return <PatentSelectTrigger item={item} corp={corp} desc={L('act_pay')}
          onClick={patent=>onPay(item, patent)} />
    }
    btn_sell(){
        const {item, onSell, onDelist} = this.props
        if (!onSell || !this.is_admin && !(this.is_owner && item.market?.type!=MarketType.Protected))
            return null
        if (item.market?.type!=MarketType.Sale){
            return <OwnerValueSelectTrigger onClick={(owner, price)=>onSell(item, owner, price)}
                desc={L('act_sell')} valDesc={LR('item_desc_price')} exclude={owners_exclude(item.type)}/>
        }
        return <RB.Container><RB.Row>
          <RB.Col>
            <PopupButton url={`/item/${item._id}/code`} desc={L('act_show_code')} />
          </RB.Col>
          <RB.Col>
            <RB.Button onClick={()=>onDelist(item)}>{L('act_delist')}</RB.Button>
          </RB.Col>
        </RB.Row></RB.Container>
    }
    btn_delete(){
        const {item, onDelete} = this.props
        if (!this.is_admin || !onDelete)
            return null
        return <RB.Button onClick={()=>onDelete(item)}>{L('act_delete')}</RB.Button>
    }
    render() {
        if (!this.props.item)
            return null
        return <RB.Col sm={this.props.layout}>
          {this.btn_pay()}
          {this.btn_sell()}
          {this.btn_delete()}
        </RB.Col>
    }
}

function LocationCol(props: ItemProps) {
    const {location} = props.item
    if (!location)
        return <RB.Col sm={props.layout}>-</RB.Col>
    return <RB.Col sm={props.layout}>
      <span>{location.system}</span>
      <span>{location.name}</span>
      <span>{location.pos.col}:{location.pos.row}</span>
    </RB.Col>
}

function ResourceCostCol(props: ItemProps){
    const {item, layout} = props
    const {resourceCost} = item as Patent
    if (!resourceCost || !resourceCost.length)
        return <RB.Col sm={props.layout}>-</RB.Col>
    const res = resourceCost.map(v=>
      <div key={`res_cost_${item._id}_${v.kind}`}>
        {LR(`res_kind_${v.kind}`)+` [${v.provided|0}/${v.value}]`}
      </div>)
    return <RB.Col sm={layout}>
      {res}
    </RB.Col>
}

export function ItemRow(props: ItemProps){
    const {item, user} = props
    const obj = new (Item.class(item.type))(item)
    const res = item as Resource, pt = item as Patent
    const has = n=>obj.keys.includes(n)
    const lyt = column_layout(obj.keys.filter(f=>!['_id', 'market'].includes(f)))
    const kind = res.kind==undefined ? '-' :
        item.type==ItemType.Patent ?
        LR(`patent_kind_${pt.kind}`)+'/'+LR(`patent_weigth_${pt.weight}`) :
        LR(`res_kind_${res.kind}`)
    const owner = item.type==ItemType.Patent ?
        pt.owners.map(o=><div key={'d_'+o._id}>{`${o.name} (${LR('patent_status_'+o.status)})`}</div>) :
        item.owner?.name||'-'
    return <RB.Row className={props.className}>
      <RB.Col sm={lyt.id}><IDField item={item} /></RB.Col>
      <RB.Col sm={lyt.name}>{item.name}</RB.Col>
      <RB.Col sm={lyt.type}>{LR(`item_type_${item.type}`)}</RB.Col>
      <RB.Col sm={lyt.kind}>{kind}</RB.Col>
      <RB.Col sm={lyt.owner}>{owner}</RB.Col>
      <LocationCol {...props} layout={lyt.location} />
      {has('resourceCost') && <ResourceCostCol {...props} layout={lyt.value} />}
      {has('value') && <RB.Col sm={lyt.value}>{res.value|0}</RB.Col>}
      <RB.Col sm={lyt.price}>{item.price}</RB.Col>
      <RB.Col sm={lyt.data}>{res.data}</RB.Col>
      <ItemActions {...props} layout={lyt.actions} />
    </RB.Row>
}


const TypeString = (t: ItemType = 0)=>ItemType[t].toLowerCase()

type ItemRowNewProps = {
    onCreate: (item: Item)=>void
}
type ItemRowNewState = {
    type?: ItemType
    name: string
    owner?: Owner
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
    owners?: Owner[]
    err?: ApiError
}
export class ItemRowNew extends React.Component<ItemRowNewProps, ItemRowNewState> {
    constructor(props){
        super(props)
        this.state = {name: ''}
    }
    stateChange(obj: any){
        this.setState(Object.assign({err: null}, obj)) }
    create() {
        const errors = this.errors
        if (errors.length){
            return this.setState({err: new FormError(errors.reduce((p, c)=>{
                p[c] = 'field_error_noempty'
                return p
            }, {}))})
        }
        this.setState({err: null})
        const item = new (Item.class(this.state.type))()
        for (let k of item.keys)
            item[k] = this.state[k]
        this.props.onCreate(item)
    }
    get row_size(){
        return 2
    }
    hasField(name: string){
        let cls = new (Item.class(this.state.type))()
        return cls.keys.includes(name)
    }
    get errors(){
        const item = new (Item.class(this.state.type))()
        return item.keys.filter(k=>!['_id', 'market'].includes(k) &&
            !this.state[k] && isNaN(this.state[k]))
    }
    get ownerExclude(){ return owners_exclude(this.state.type) }
    // resource
    fields_resource(){
        const row_size = this.row_size
        const {kind, value} = this.state
        const kindChange = kind=>this.stateChange({kind})
        const valChange = value=>this.stateChange({value})
        return [<RB.Col sm={row_size} key='resource_kind_select'>
          <ResourceSelect value={kind} onChange={kindChange} />
        </RB.Col>,
        <RB.Col sm={row_size} key='resource_value_select'>
          <NumberInput placeholder={LR('res_desc_value')} value={value} onChange={valChange} />
        </RB.Col>]
    }
    // coordinates
    fields_coordinates(){
        const {target} = this.state
        const targetChange = target=>this.stateChange({target})
        return [<RB.Col sm={4} key='coord_target_select'>
          <LocationSelect onChange={targetChange} value={target} optName='item_desc_target' />
        </RB.Col>]
    }
    // module
    fields_module(){
        const row_size = this.row_size
        const {mass, energy} = this.state
        const massChange = mas=>this.stateChange({mass})
        const energyChange = energy=>this.stateChange({energy})
        return [<RB.Col sm={row_size} key='module_mass_input'>
          <NumberInput placeholder={LR('item_desc_mass')} value={mass} onChange={massChange} />
        </RB.Col>, <RB.Col sm={row_size} key='module_energy_input'>
          <NumberInput placeholder={LR('item_desc_energy')} value={energy} onChange={energyChange} />
        </RB.Col>]
    }
    // patent
    fields_patent(){
        const row_size = this.row_size
        const {kind, weight} = this.state
        const kindChange = kind=>this.stateChange({kind})
        const weightChange = weight=>this.stateChange({weight})
        return [<RB.Col sm={row_size} key='patent_type_select'>
          <PatentTypeSelect value={kind} onChange={kindChange} />
        </RB.Col>,
        <RB.Col sm={row_size} key='patent_weight_select'>
          <PatentWeightSelect value={weight} onChange={weightChange} />
        </RB.Col>]
    }
    rows_patent(){
        const {owners, resourceCost} = this.state
        const ownersChange = owners=>this.stateChange({owners})
        const resChange = resourceCost=>this.stateChange({resourceCost})
        return [
          <MultiOwnerSelect value={owners} exclude={this.ownerExclude}
            className='menu-input-row' key='multi_owner_select'
            onChange={ownersChange} />,
          <MultiResourceSelect value={resourceCost} onChange={resChange}
            className='menu-input-row' key='multi_resource_select' />
        ]
    }
    // artifact
    fields_artifact(){
        const row_size = this.row_size
        const {kind} = this.state
        const kindChange = kind=>this.stateChange({kind})
        return [<RB.Col sm={row_size} key='artifact_kind_select'>
          <ArtifactTypeSelect value={kind} onChange={kindChange} />
        </RB.Col>]
    }
    fields_top(){
        const {type, price} = this.state
        const row_size = this.row_size 
        const top_fields = (this[`fields_${TypeString(type)}`] || (()=>[])).call(this)
        const typeChange = type=>this.stateChange({type})
        const priceChange = price=>this.stateChange({price})
        return <RB.Row className='menu-input-row'>
          <RB.Col sm={row_size}>{L('act_item_create')}</RB.Col>
          <RB.Col sm={row_size}>
            <TypeSelect value={type} onChange={typeChange}/>
          </RB.Col>
          {top_fields}
         <RB.Col sm={row_size}>
            <NumberInput placeholder={LR('item_desc_price')} value={price} onChange={priceChange} />
          </RB.Col>
          <RB.Col sm={row_size}>
            <RB.Button disabled={this.errors.length} onClick={()=>this.create()}>
              {L('act_create')}</RB.Button>
          </RB.Col>
        </RB.Row>
    }
    fields_bottom(){
        const {type, name, data, owner, location} = this.state
        const btm_fields = (this[`fields_${TypeString(type)}_b`] || (()=>[])).call(this)
        const nameChange = ({target: {value}})=>this.stateChange({name: value})
        const dataChange = ({target: {value}})=>this.stateChange({data: value})
        const ownerChange = owner=>this.stateChange({owner})
        const locChange = location=>this.stateChange({location})
        return <RB.Row className='menu-input-row'>
          <RB.Col sm={2}>
            <RB.FormControl as='textarea' rows={3} placeholder={LR('item_desc_data')}
              value={data} onChange={dataChange} />
          </RB.Col>
          {this.hasField('name') && <RB.Col sm={2}>
            <RB.FormControl placeholder={LR('item_desc_name')}
              value={name} onChange={nameChange} />
          </RB.Col>}
          {this.hasField('owner') && <RB.Col sm={4}>
            <OwnerSelect value={owner} onChange={ownerChange} exclude={this.ownerExclude} />
          </RB.Col>}
          {this.hasField('location') && <RB.Col sm={4}>
            <LocationSelect onChange={locChange} value={location} />
          </RB.Col>}
          {btm_fields}
        </RB.Row>
    }
    render(){
        const {type} = this.state
        const rows = (this[`rows_${TypeString(type)}`] || (()=>[])).call(this)
        return <RB.InputGroup>
          {this.fields_top()}
          {this.fields_bottom()}
          {rows}
        </RB.InputGroup>
    }
}


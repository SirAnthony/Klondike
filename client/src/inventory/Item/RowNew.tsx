import React from 'react'
import * as RB from 'react-bootstrap'
import {Item, ItemType, ModuleBoosts} from '../../common/entity'
import {Owner, Location} from '../../common/entity'
import {ResourceType} from '../../common/entity'
import {ResourceSelect, TypeSelect, PatentTypeSelect, TextInput, ModuleBoostsSelect} from '../../util/inputs'
import {PatentWeightSelect, ArtifactTypeSelect} from '../../util/inputs'
import {NumberInput, LocationSelect, OwnerSelect} from '../../util/inputs'
import {MultiOwnerSelect, MultiResourceSelect} from '../../util/inputs'
import {ApiError, FormError} from '../../common/errors'
import {default as L, LR} from '../locale'
import * as iutil from './util'
import { EditButtons } from 'src/util/buttons'

const TypeString = (t: ItemType = 0)=>ItemType[t].toLowerCase()

export type ItemSend = {
    kind?: number
    value?: number
    // known: Owner[] // no need
    // Coordinates
    target?: Location
    // Module
    mass?: number
    energy?: number
    installed?: boolean
    boosts?: ModuleBoosts
    // Patent
    weight?: number
    owners?: Owner[]
    resourceCost?: {kind: ResourceType, value: number}[]
    served?: Owner[]
    ready?: boolean
    // Img?
    imgFile?: File
} & Omit<Item, 'keys' | 'class'>

type ItemRowNewProps = {
    add?: boolean
    item?: ItemSend
    onSubmit: (item: Item)=>void
    onCancel?: ()=>void
}
type ItemRowNewState = {
    err?: ApiError
} & ItemSend

export class ItemRowNew extends React.Component<ItemRowNewProps, ItemRowNewState> {
    constructor(props){
        super(props)
        this.state = Object.assign({}, props.item)
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
        // imgFile omited if present
        this.props.onSubmit(item)
    }
    get row_size(){ return 2 }
    hasField(name: string){
        let cls = new (Item.class(this.state.type))()
        return cls.keys.includes(name)
    }
    get errors(){
        const item = new (Item.class(this.state.type))()
        return item.keys.filter(k=>!['_id', 'market', 'owner', 'owners', 'served',
            'ready', 'location', 'installed'].includes(k) &&
            !this.state[k] && isNaN(this.state[k]))
    }
    get ownerExclude(){ return iutil.owners_exclude(this.state.type) }
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
    rows_coordinates(){
        const {owners} = this.state
        const ownersChange = owners=>this.stateChange({owners})
        return [
          <MultiOwnerSelect value={owners} exclude={this.ownerExclude}
            className='menu-input-row' key='multi_owner_select'
            onChange={ownersChange} />,
        ]
    }
    // module
    fields_module(){
        const row_size = this.row_size
        const {mass, energy} = this.state
        const massChange = mass=>this.stateChange({mass})
        const energyChange = energy=>this.stateChange({energy})
        return [<RB.Col sm={row_size} key='module_mass_input'>
          <NumberInput placeholder={LR('item_desc_mass')} value={mass} onChange={massChange} />
        </RB.Col>, <RB.Col sm={row_size} key='module_energy_input'>
          <NumberInput placeholder={LR('item_desc_energy')} value={energy} onChange={energyChange} />
        </RB.Col>]
    }
    rows_module(){
        const {boosts} = this.state
        const boostsChange = boosts=>this.stateChange({boosts})
        return [
          <ModuleBoostsSelect value={boosts} onChange={boostsChange} />
        ]
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
        const {owners, served, resourceCost} = this.state
        const ownersChange = owners=>this.stateChange({owners})
        const resChange = resourceCost=>this.stateChange({resourceCost})
        const servedChange = served=>this.stateChange({served})
        return [
          <MultiOwnerSelect value={owners} exclude={this.ownerExclude}
            className='menu-input-row' key='multi_owner_select'
            onChange={ownersChange} />,
          <MultiResourceSelect value={resourceCost} onChange={resChange}
            className='menu-input-row' key='multi_resource_select' />,
          <MultiOwnerSelect value={served} exclude={this.ownerExclude}
            className='menu-input-row' key='multi_owner_select'
            onChange={servedChange} title={LR('patent_desc_transferred')} />,
        ]
    }
    // artifact
    fields_artifact(){
        const row_size = this.row_size
        const {kind} = this.state
        const kindChange = kind=>this.stateChange({kind})
        return [<RB.Col sm={row_size} key='artifact_kind_select'>
          <ArtifactTypeSelect value={kind} onChange={kindChange} />
        </RB.Col>,
        <RB.Col sm={row_size}></RB.Col>]
    }
    fields_top(){
        const {type, price} = this.state
        const row_size = this.row_size 
        const top_fields = (this[`fields_${TypeString(type)}`] || (()=>[])).call(this)
        const typeChange = type=>this.stateChange({type})
        const priceChange = price=>this.stateChange({price})
        return <RB.Row className='menu-input-row'>
          {this.props.add && <RB.Col sm={row_size}>{L('act_item_create')}</RB.Col>}
          <RB.Col sm={row_size}>
            <TypeSelect value={type} onChange={typeChange}/>
          </RB.Col>
          {top_fields}
          <RB.Col sm={row_size}>{this.hasField('price') &&
            <NumberInput placeholder={LR('item_desc_price')} value={price} onChange={priceChange} />}
          </RB.Col>
          <RB.Col sm={row_size}>
            <EditButtons disabled={this.errors.length} add={this.props.add}
              onSubmit={()=>this.create()} onCancel={this.props.onCancel} />
          </RB.Col>
        </RB.Row>
    }
    fields_bottom(){
        const {type, name, data, owner, location} = this.state
        const btm_fields = (this[`fields_${TypeString(type)}_b`] || (()=>[])).call(this)
        const ownerChange = owner=>this.stateChange({owner})
        const locChange = location=>this.stateChange({location})
        return <RB.Row className='menu-input-row'>
          <RB.Col sm={2}>
            <TextInput as='textarea' rows={3} placeholder={LR('item_desc_data')}
              value={data} onChange={data=>this.stateChange({data})} />
          </RB.Col>
          {this.hasField('name') && <RB.Col sm={2}>
            <TextInput value={name} onChange={name=>this.stateChange({name})}
              placeholder={LR('item_desc_name')} />
          </RB.Col>}
          {this.hasField('owner') && <RB.Col sm={4}>
            <OwnerSelect value={owner} onChange={ownerChange} exclude={this.ownerExclude}
              nullable={true} />
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


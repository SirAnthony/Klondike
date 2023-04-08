import React from 'react'
import * as RB from 'react-bootstrap'
import {ItemType, ResourceType, PatentType, PatentWeight, ArtifactType} from '../common/entity'
import {Patent, Corporation} from '../common/entity'
import {ID, Location, Item, Resource} from '../common/entity'
import {Select as USelect, TypedSelect} from '../util/select'
import {Select as PSelect} from '../map/List'
import {Select as CSelect, PatentSelect as RPSelect} from '../corp/List'
import L from '../common/locale'
import * as _ from 'lodash'

export function NumberInput(props: {value?: number, placeholder: string, onChange: (l: number)=>void}){
    const empty = typeof props.value==='undefined'
    const val =  empty ? undefined : +props.value
    const onChange = ({target: {value}})=>props.onChange(isNaN(+value) ? val : +value)
    return <RB.FormControl placeholder={props.placeholder} value={empty ? '' : val} onChange={onChange} />
}

export const ResourceSelect = TypedSelect(ResourceType, 'res_kind', 'res_desc_kind')
export const TypeSelect = TypedSelect(ItemType, 'item_type', 'item_desc_type')
export const PatentTypeSelect = TypedSelect(PatentType, 'patent_kind', 'patent_desc_kind')
export const PatentWeightSelect = TypedSelect(PatentWeight, 'patent_weigth', 'patent_desc_weight')
export const ArtifactTypeSelect = TypedSelect(ArtifactType, 'artifact_kind', 'artifact_desc_kind')

export function PatentSelect(props: {value?: Patent, corp: Corporation,
    item: Item, onChange: (p: Patent)=>void}){
    const {value, corp, item, onChange} = props
    const res = item as Resource
    const filter = (p: Patent)=>p.resourceCost.some(r=>
        r.kind==res.kind && ((r.provided|0)<r.value))
    return <RPSelect value={value} corp={corp} filter={filter} onChange={onChange} />
}

export function LocationSelect(props: {value?: Location, optName?: string, onChange: (loc: Location)=>void}){
    const {value} = props
    const [location, setLocation] = React.useState(value)
    const [coord, setCoord] = React.useState(!value ? '' : `${value.pos.col}:${value.pos.row}`)
    const updateLocation = (loc, coord)=>{
        setLocation(loc)
        setCoord(coord)
        const pos = coord?.split(':')
        props.onChange({_id: loc._id, name: loc.name, system: loc?.system,
            pos: {col: +pos[0], row: +pos[1]}})
    }
    const locChange = value=>updateLocation(value, coord)
    const coordChange = ({target: {value}})=>updateLocation(location, value)
    return <RB.Container>
      <RB.Row><RB.Col>
        <PSelect value={location} onChange={locChange} optName={props.optName} />
      </RB.Col>
      <RB.Col>
        <RB.FormControl value={coord} onChange={coordChange} disabled={!location}
            placeholder={L('loc_desc_coord')} />
      </RB.Col>
      </RB.Row>
    </RB.Container>
}

export function OwnerSelect(props: {value?: ID, filter?: (val: ID)=>Boolean,
    onChange: (owner: ID)=>void}){
    const [owner, setOwner] = React.useState(props.value)
    const ownerChange = owner=>{ setOwner(owner); props.onChange(owner) }
    return <CSelect value={owner} filter={props.filter} onChange={ownerChange} />
}

export function MultiOwnerSelect(props: {value?: ID[],
    className?: string, onChange: (owners: ID[])=>void}){
    const [owner, setOwner] = React.useState(null)
    const addOwner = ()=>owner && props.onChange(_.uniqBy([].concat(
        owner, props.value).filter(Boolean), f=>f._id))
    const removeOwner = (_id: string)=>props.onChange(_.uniqBy([].concat(
        props.value).filter(o=>o && o._id!=_id), f=>f._id))
    const owners = props.value?.map(o=><RB.Container key={`sel_owner_${o._id}`}
      className='selected-item'>{o.name}<RB.CloseButton onClick={()=>removeOwner(o._id)} />
    </RB.Container>)
    return <RB.Row className={props.className}>
      <RB.Col sm={2}>
        <OwnerSelect value={owner} onChange={setOwner} />
      </RB.Col>
      <RB.Col sm={2}>
        <RB.Button onClick={addOwner}>{L('act_add')}</RB.Button>
      </RB.Col>
      <RB.Col sm={8}>
        {owners}
      </RB.Col>
    </RB.Row>
}

type ResItem = {kind: ResourceType, value: number}
export function MultiResourceSelect(props: {value?: ResItem[],
    className?: string, onChange: (values: ResItem[])=>void}){
    const [kind, setKind] = React.useState(null)
    const [value, setValue] = React.useState(0)
    const addRes = ()=>kind!==null && kind>=0 && value>=0 && props.onChange(_.uniqBy(
        [].concat({kind, value}, props.value).filter(Boolean), f=>f.kind))
    const removeRes = (kind: number)=>props.onChange(_.uniqBy([].concat(
        props.value).filter(o=>o && o.kind!=kind), f=>f.kind))
    const resources = props.value?.map(o=><RB.Container key={`sel_res_${o.kind}`} className='selected-item'>
      {L(`res_kind_${o.kind}`)} [{o.value}]<RB.CloseButton onClick={()=>removeRes(o.kind)} />
    </RB.Container>)
    return <RB.Row className={props.className}>
      <RB.Col sm={2}>
        <ResourceSelect value={kind} onChange={setKind}/>
      </RB.Col>
      <RB.Col sm={1}>
        <NumberInput placeholder={L('res_desc_value')} value={value} onChange={setValue} />
      </RB.Col>
      <RB.Col sm={2}>
        <RB.Button onClick={addRes}>{L('act_add')}</RB.Button>
      </RB.Col>
      <RB.Col sm={7}>
        {resources}
      </RB.Col>
    </RB.Row>
}
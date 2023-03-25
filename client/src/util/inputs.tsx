import React from 'react'
import * as RB from 'react-bootstrap'
import {ItemType, ResourceType, PatentType, PatentWeight, ArtifactType} from '../common/entity'
import {ID, Location} from '../common/entity'
import {Select as USelect, TypedSelect} from '../util/select'
import {Select as PSelect} from '../map/List'
import {Select as CSelect} from '../corp/List'
import L from '../common/locale'
import * as _ from 'lodash'

export function NumberInput(props: {value?: number, placeholder: string, onChange: (l: number)=>void}){
    const onChange = ({target: {value}})=>
        props.onChange(isNaN(+value) ? !value ? undefined : props.value : +value)
    return <RB.FormControl placeholder={props.placeholder} value={props.value} onChange={onChange} />
}

export const ResourceSelect = TypedSelect(ResourceType, 'res_kind', 'res_desc_kind')
export const TypeSelect = TypedSelect(ItemType, 'item_type', 'item_desc_type')
export const PatentTypeSelect = TypedSelect(PatentType, 'patent_kind', 'patent_desc_kind')
export const PatentWeightSelect = TypedSelect(PatentWeight, 'patent_weigth', 'patent_desc_weight')
export const ArtifactTypeSelect = TypedSelect(ArtifactType, 'artifact_kind', 'artifact_desc_kind')

export function LocationSelect(props: {value?: Location, optName?: string, onChange: (loc: Location)=>void}){
    const {value} = props
    const [location, setLocation] = React.useState(value)
    const [coord, setCoord] = React.useState(!value ? '' : `${value.pos.col}:${value.pos.row}`)
    const updateLocation = ()=>{
        const pos = coord?.split(':')
        props.onChange({_id: location._id, name: location.name,
            system: location.system, pos: {col: +pos[0], row: +pos[1]}})
    }
    const locChange = value=>{ setLocation(value); updateLocation() }
    const coordChange = ({target: {value}})=>{ setCoord(value); updateLocation() }
    return <RB.Container>
      <RB.Row><RB.Col>
        <PSelect value={location} onChange={locChange} optName={props.optName} />
      </RB.Col>
      <RB.Col>
        <RB.FormControl value={coord} onChange={coordChange}
            placeholder={L('loc_desc_coord')} />
      </RB.Col>
      </RB.Row>
    </RB.Container>
}

export function OwnerSelect(props: {value?: ID, onChange: (owner: ID)=>void}){
    const [owner, setOwner] = React.useState(props.value)
    const ownerChange = owner=>{ setOwner(owner); props.onChange(owner) }
    return <CSelect value={owner} onChange={ownerChange} />
}

export function MultiOwnerSelect(props: {value?: ID[],
    className?: string, onChange: (owners: ID[])=>void}){
    const [owner, setOwner] = React.useState(null)
    const addOwner = ()=>owner && props.onChange(_.uniqBy([].concat(
        owner, props.value).filter(Boolean), f=>f._id))
    const removeOwner = (_id: string)=>props.onChange(_.uniqBy([].concat(
        props.value).filter(o=>o && o._id!=_id), f=>f._id))
    const owners = props.value?.map(o=><RB.Container key={`sel_owner_${o._id}`}>
      {o.name}<RB.CloseButton onClick={()=>removeOwner(o._id)} />
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
    const addRes = ()=>kind>=0 && value>=0 && props.onChange(_.uniqBy([].concat(
        {kind, value}, props.value).filter(Boolean), f=>f.kind))
    const removeRes = (kind: number)=>props.onChange(_.uniqBy([].concat(
        props.value).filter(o=>o && o.kind!=kind), f=>f.kind))
    const resources = props.value?.map(o=><RB.Container key={`sel_res_${o.kind}`}>
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
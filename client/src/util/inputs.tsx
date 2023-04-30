import React from 'react'
import * as RB from 'react-bootstrap'
import {ItemType, ResourceType, PatentType, Institution} from '../common/entity'
import {PatentWeight, ResourceSpecialityType, ShipClass} from '../common/entity'
import {ArtifactType, UserType, ResourceValueInfo} from '../common/entity'
import {PlanetType, Pos} from '../common/entity'
import {Patent, InstitutionType} from '../common/entity'
import {ID, Owner, Location, Item, Resource} from '../common/entity'
import {TypedSelect} from '../util/select'
import {Select as PSelect} from '../map/List'
import {Images} from '../common/urls'
import {Select as CSelect, PatentSelect as RPSelect} from '../corp/List'
import {ApiStackError} from '../common/errors'
import L from '../common/locale'
import config from '../common/config'
import * as _ from 'lodash'

type TextInputProps = {
    value: string
    placeholder: string
    name?: string
    described?: string
    autoComplete?: boolean
    disabled?: boolean
    as?: React.ElementType<any>
    rows?: number
    type?: string
    onChange: (l: string)=>void
    err?: ApiStackError
}

export function LoginInput(props: TextInputProps){
    const {server} = config
    return <RB.InputGroup>
      <TextInput {...props} />
      <RB.InputGroup.Text id={props.described}>{`@${server.domain}`}</RB.InputGroup.Text>
    </RB.InputGroup>
}

export function TextInput(props: TextInputProps){
    const onChange = ({target: {value}})=>props.onChange(value)
    const cls = props.err ? 'input-error' : ''
    const complete = props.autoComplete ? undefined : 'new-password'
    const controlId = (Math.random() + 1).toString(36).substring(7);
    return <RB.FloatingLabel controlId={controlId} label={props.placeholder}>
      <RB.FormControl {...props} className={cls} onChange={onChange}
        aria-label={props.placeholder} aria-describedby={props.described}
        autocomplete={complete} />
    </RB.FloatingLabel>
}

type NumberInputProps = {
    value: number
    placeholder: string
    onChange: (l: number)=>void
    err?: ApiStackError
}

export function NumberInput(props: NumberInputProps){
    const empty = typeof props.value==='undefined'
    const val =  empty ? undefined : +props.value
    const onChange = ({target: {value}})=>props.onChange(isNaN(+value) ? val : +value)
    const cls = props.err ? 'input-error' : ''
    const controlId = (Math.random() + 1).toString(36).substring(7);
    return <RB.FloatingLabel controlId={controlId} label={props.placeholder}>
      <RB.FormControl placeholder={props.placeholder} value={empty ? '' : val}
        className={cls} onChange={onChange} />
    </RB.FloatingLabel>
}

type CoordinatesInputProps = {
    value: Pos
    disabled?: boolean
    onChange: (l: Pos)=>void
}
export function CoordinatesInput(props: CoordinatesInputProps){
    const {value} = props
    const [coord, setCoord] = React.useState(!value ? undefined : `${value.col}:${value.row}`)
    const coordChange = (val)=>{
      setCoord(val)
      const pos = val?.split(':')
      props.onChange(pos?.length>1 ? {col: +pos[0], row: +pos[1]} : null)
    }
    return <TextInput {...props} value={coord} onChange={coordChange}
        placeholder={L('loc_desc_coord')} />
}

type ImageInputProps = {
    placeholder?: string
    source: Institution | Item
    onChange: (data: FormData)=>void
} & Omit<TextInputProps, 'value' | 'placeholder' | 'onChange'>
export function ImageInput(props: ImageInputProps){
    const onChange = ({target})=>props.onChange(target.files[0])
    const src = Images.get(props.source)
    const cls = props.err ? 'input-error' : ''
    return <RB.Container>
      <RB.Row className='form-image-row-image'>
        <RB.Image src={src} className='form-image' />
      </RB.Row>
      <RB.Row>
        <RB.FormControl type="file" className={cls} {...props} onChange={onChange}
          accept=".png,.jpg,.jpeg,.webp" />
      </RB.Row>
    </RB.Container>

}

// Selects

export const ResourceSelect = TypedSelect(ResourceType, 'res_kind', 'res_desc_kind')
export const TypeSelect = TypedSelect(ItemType, 'item_type', 'item_desc_type')
export const PatentTypeSelect = TypedSelect(PatentType, 'patent_kind', 'patent_desc_kind')
export const PatentWeightSelect = TypedSelect(PatentWeight, 'patent_weigth', 'patent_desc_weight')
export const ArtifactTypeSelect = TypedSelect(ArtifactType, 'artifact_kind', 'artifact_desc_kind')
export const InstitutionTypeSelect = TypedSelect(InstitutionType, 'institution_type', 'institution_desc')
export const ShipClassSelect = TypedSelect(ShipClass, '', 'ship_desc_kind')
export const ResourceSpecialitySelect = TypedSelect(ResourceSpecialityType, 'res_spec_value', 'res_desc_kind')
export const UserTypeSelect = TypedSelect(UserType, 'user_kind', 'user_desc_kind', true)
export const PlanetTypeSelect = TypedSelect(PlanetType, '', 'planet_desc_kind')

export function PatentSelect(props: {value?: Patent, owner: Owner,
    item: Item, onChange: (p: Patent)=>void}){
    const {item} = props
    const res = item as Resource
    const filter = (p: Patent)=>p.resourceCost.some(r=>
        +r.kind===+res.kind && ((r.provided|0)<r.value))
    return <RPSelect filter={filter} {...props} />
}

export function LocationSelect(props: {value?: Location, optName?: string, onChange: (loc: Location)=>void}){
    const {value} = props
    const coordChange = pos=>props.onChange(Object.assign({}, value, {pos}))
    return <RB.Container><RB.Row>
      <RB.Col>
        <PSelect value={value} onChange={props.onChange} optName={props.optName} />
      </RB.Col>
      <RB.Col>
        <CoordinatesInput value={value?.pos} onChange={coordChange} disabled={!value} />
      </RB.Col>
    </RB.Row></RB.Container>
}

const asID = (obj: ID) : ID|null => {
    return obj ? {_id: obj._id, name: obj.name} : null
}

export function OwnerSelect(props: {value?: Owner, filter?: (val: Owner)=>Boolean,
    exclude?: number[], title?: string, onChange: (owner: Owner)=>void}){
    const [instType, setInstType] = React.useState(props.value?.type)
    const [id, setId] = React.useState(asID(props.value))
    const ownerChange = (type: InstitutionType, id: ID)=>{
      const obj = asID(id), owner = Object.assign({type}, obj)
      setInstType(type)
      setId(obj)
      props.onChange(owner)
    }
    return <RB.Row>
      <RB.Col>
        <InstitutionTypeSelect value={instType} exclude={props.exclude}
          onChange={type=>ownerChange(type, id)} title={props.title} />
      </RB.Col>
      <RB.Col className='flex-center'>
        <CSelect value={id} type={instType} filter={props.filter}
          onChange={id=>ownerChange(instType, id)} disabled={isNaN(instType)} />
      </RB.Col>
    </RB.Row>
}

export function MultiOwnerSelect(props: {value?: Owner[], className?: string,
    exclude?: number[], onChange: (owners: Owner[])=>void}){
    const [owner, setOwner] = React.useState(null)
    const addOwner = ()=>owner && props.onChange(_.uniqBy([].concat(
        owner, props.value).filter(f=>f?._id&&f.type), f=>f._id))
    const removeOwner = (_id: string)=>props.onChange(_.uniqBy([].concat(
        props.value).filter(o=>o && o._id!==_id), f=>f._id))
    const owners = props.value?.map(o=><RB.Container key={`sel_owner_${o._id}`}
      className='selected-item'>{o.name}<RB.CloseButton onClick={()=>removeOwner(o._id)} />
    </RB.Container>)
    return <RB.Row className={props.className}>
      <RB.Col sm={4}>
        <OwnerSelect value={owner} exclude={props.exclude} onChange={setOwner} />
      </RB.Col>
      <RB.Col sm={2}>
        <RB.Button onClick={addOwner}>{L('act_add')}</RB.Button>
      </RB.Col>
      <RB.Col sm={6}>
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
        [].concat({kind, value}, props.value).filter(f=>!isNaN(+f?.kind)&&f?.value), f=>f.kind))
    const removeRes = (kind: number)=>props.onChange(_.uniqBy([].concat(
        props.value).filter(o=>o && +o.kind!==+kind), f=>f.kind))
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

export function ResourceValueSelect(props: {value?: ResourceValueInfo, onChange: (info: ResourceValueInfo)=>void}){
    const onChange = (k: ResourceType, v: ResourceSpecialityType)=>
        props.onChange(Object.assign({}, props.value, {[k]: v}))
    const cols = Object.keys(ResourceType).filter(k=>!isNaN(+k)).map(k=>[<RB.Col>
      {L(`res_kind_${k}`)}
    </RB.Col>, <RB.Col>
      <ResourceSpecialitySelect value={(props.value||{})[+k]} onChange={v=>onChange(+k, v)} />
    </RB.Col>]).flat()
    return <RB.Row className='menu-list-row'>
      {cols}
    </RB.Row>
}

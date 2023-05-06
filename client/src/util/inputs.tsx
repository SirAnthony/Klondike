import React from 'react'
import * as RB from 'react-bootstrap'
import {ItemType, ResourceType, PatentType, Institution, FlightType, FlightStatus, UserTypeIn, ModuleBoosts, ModStat, FlightKind, LogAction} from '../common/entity'
import {PatentWeight, ResourceSpecialityType, ShipClass} from '../common/entity'
import {ArtifactType, UserType, ResourceValueInfo, Order} from '../common/entity'
import {ResourceCost} from '../common/entity'
import {PlanetType, Pos} from '../common/entity'
import {Patent, InstitutionType} from '../common/entity'
import {ID, Owner, Location, Item, Resource} from '../common/entity'
import {TypedMultiSelect, TypedSelect} from '../util/select'
import {Select as PSelect} from '../map/List'
import {Images} from '../common/urls'
import {Select as CSelect, PatentSelect as RPSelect} from '../corp/List'
import {OrderSelect as OSelect} from '../corp/List'
import {ApiStackError, ClientError} from '../common/errors'
import L from '../common/locale'
import config from '../common/config'
import * as date from '../common/date'
import * as _ from 'lodash'

export const RandomID = ()=>(Math.random() + 1).toString(36).substring(7)

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
    return <RB.FloatingLabel controlId={RandomID()} label={props.placeholder}>
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
    return <RB.FloatingLabel controlId={RandomID()} label={props.placeholder}>
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
    const [err, setErr] = React.useState(
        !/^[0-9]+:[0-9]+$/.test(coord) ? new ClientError('incorrect_input') : null)
    const coordChange = (val)=>{
      if (/^[0-9]*(:[0-9]*)?$/.test(val))
          setCoord(val)
      if (!/^[0-9]+:[0-9]+$/.test(val))
          return setErr(new ClientError('incorrect_input'))
      setErr(null)
      const pos = val?.split(':')
      props.onChange(pos?.length>1 ? {col: +pos[0], row: +pos[1]} : null)
    }
    return <TextInput {...props} value={coord} onChange={coordChange}
        placeholder={L('loc_desc_coord')} err={err} />
}

type ImageInputProps = {
    placeholder?: string
    source: Omit<Institution, 'keys' | 'class'> | Item
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

type TimeInputProps = {
    value: number
    placeholder?: string
    onChange: (ts: number)=>void
} & Omit<TextInputProps, 'value' | 'onChange' | 'placeholder'>
export function TimeInput(props: TimeInputProps){
    const test_re = /^((?:[01]?\d|2[0-3]):[0-5]\d)(?::[0-5]\d)?$/
    const check = (s: string)=>!test_re.test(s) ? new ClientError('incorrect_input') : null
    const [value, setValue] = React.useState(date.time(props.value))
    const [err, setErr] = React.useState(check(value))
    const onChange = (s: string)=>{
        setValue(s)
        setErr(check(s))
        const match = test_re.exec(s)
        if (match)
            props.onChange(+date.nextTime(match[1]))
    }
    return <TextInput placeholder={L('desc_time')} {...props} err={err}
        value={value} onChange={onChange} />
}

// Selects

export const ResourceSelect = TypedSelect(ResourceType, 'res_kind', 'res_desc_kind')
export const TypeSelect = TypedSelect(ItemType, 'item_type', 'item_desc_type')
export const PatentTypeSelect = TypedSelect(PatentType, 'patent_kind', 'patent_desc_kind')
export const PatentWeightSelect = TypedSelect(PatentWeight, 'patent_weigth', 'patent_desc_weight')
export const ArtifactTypeSelect = TypedSelect(ArtifactType, 'artifact_kind', 'artifact_desc_kind')
export const InstitutionTypeSelect = TypedSelect(InstitutionType, 'institution_type', 'institution_desc')
const FreeInstitutionTypeSelect = TypedSelect(InstitutionType, 'institution_type', 'institution_desc', true)
export const ShipClassSelect = TypedSelect(ShipClass, '', 'ship_desc_kind')
export const ResourceSpecialitySelect = TypedSelect(ResourceSpecialityType, 'res_spec_value', 'res_desc_kind')
export const FlightTypeSelect = TypedSelect(FlightType, 'flight_type', 'flight_desc_type')
export const FlightKindSelect = TypedSelect(FlightKind, 'flight_kind', 'flight_desc_kind')
export const FlightStatusSelect = TypedSelect(FlightStatus, 'flight_status', 'flight_desc_status')
export const PlanetTypeSelect = TypedSelect(PlanetType, '', 'planet_desc_kind')
export const ModStatSelect = TypedSelect(ModStat, 'ship_stat', 'ship_stats_title')
export const LogActionSelect = TypedSelect(LogAction, 'log_action', 'log_desc_action')

const UserTypeSelectArr = TypedMultiSelect(UserType, 'user_kind', 'user_desc_kind', true)
export function UserTypeSelect(props: {value?: UserType, disabled?: boolean, optName?: string,
    filter?: (t: UserType)=>Boolean, onChange: (value: UserType)=>void}){
    const value = Object.keys(UserType).filter(k=>UserTypeIn({kind: props.value} as any, +k))
        .map(v=>''+v)
    const onChange = (arr: UserType[])=>
      props.onChange(!arr?.length ? null : arr.reduce((p, c)=>p|=c, 0))
    return <UserTypeSelectArr {...props} value={value} onChange={onChange} />
}

export function PatentSelect(props: {value?: Patent, owner: Owner,
    item: Item, onChange: (p: Patent)=>void}){
    const {item} = props
    const res = item as Resource
    const filter = (p: Patent)=>p.resourceCost.some(r=>
        +r.kind===+res.kind && ((r.provided|0)<r.value))
    return <RPSelect filter={filter} {...props} />
}

export function OrderSelect(props: {value?: Order, owner: Owner,
    item: Item, onChange: (p: Order)=>void}){
    const {item} = props
    const res = item as Resource
    const filter = (o: Order)=>o.resourceCost.some(c=>
        +c.kind===+res.kind && (c.value|0)>(c.provided|0))
    return <OSelect filter={filter} {...props} />
}

export function LocationSelect(props: {value?: Location, optName?: string,
    disabled?: boolean, onChange: (loc: Location)=>void}){
    const [value, setValue] = React.useState(props.value)
    const [point, setPoint] = React.useState(props.value?.pos)
    const check = val=>val===null || (val._id && !isNaN(+val.pos?.col) && !isNaN(+val.pos?.row))
    const [err, setErr] = React.useState(null)
    const onChange = (val: Location, pos?: Pos)=>{
        setPoint(pos)
        const obj = val===null ? val : {...val, pos}
        setValue(obj)
        if (!check(obj))
            return void setErr(new ClientError('incorrect input'))
        props.onChange(obj)
    }
    return <RB.Container><RB.Row>
      <RB.Col>
        <PSelect value={value?._id} onChange={val=>onChange(val, point)} optName={props.optName} />
      </RB.Col>
      <RB.Col>
        <CoordinatesInput value={point} onChange={pos=>onChange(value, pos)}
          disabled={props.disabled || !value} />
      </RB.Col>
    </RB.Row></RB.Container>
}

const asID = (obj: ID) : ID|null => {
    return obj ? {_id: obj._id, name: obj.name} : null
}

export function OwnerSelect(props: {value?: Owner, filter?: (val: Owner)=>Boolean,
    exclude?: number[], title?: string, nullable?: boolean, onChange: (owner: Owner)=>void}){
    const [instType, setInstType] = React.useState(props.value?.type)
    const [id, setId] = React.useState(asID(props.value))
    const ownerChange = (type: InstitutionType, id: ID)=>{
      const obj = asID(id)
      setInstType(type)
      setId(obj)
      props.onChange(type===null ? null : {type, ...obj})
    }
    return <RB.Row>
      <RB.Col>
        {props.nullable && <FreeInstitutionTypeSelect value={instType} exclude={props.exclude}
          onChange={type=>ownerChange(type, id)} title={props.title} />}
        {!props.nullable && <InstitutionTypeSelect value={instType} exclude={props.exclude}
          onChange={type=>ownerChange(type, id)} title={props.title} />}
      </RB.Col>
      <RB.Col className='flex-center'>
        <CSelect value={id?._id} type={instType} filter={props.filter}
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

export type ResourceCostID = {_id: number} & ResourceCost
export function ResourceCostSelect(props: {value?: ResourceCostID, className?: string,
    onChange: (values: ResourceCostID)=>void, onDelete?: ()=>void}){
    const [kind, setKind] = React.useState(props.value?.kind)
    const [value, setValue] = React.useState(props.value?.value)
    const [provided, setProvided] = React.useState(props.value?.provided)
    const onChange = (kind, value, provided)=>{
        setKind(kind)
        setValue(value)
        setProvided(provided)
        props.onChange({kind, value, provided, _id: props.value?._id})
    }
    const errClass = (v: boolean)=>v ? new ClientError('value error') : null
    return <RB.Row className={props.className}>
      <RB.Col>
        <ResourceSelect value={kind} onChange={v=>onChange(v, value, provided)}/>
      </RB.Col>
      <RB.Col>
        <NumberInput placeholder={L('res_desc_value')} value={value}
          onChange={v=>onChange(kind, v, provided)} err={errClass(isNaN(+value))} />
      </RB.Col>
      <RB.Col>
        <NumberInput placeholder={L('res_desc_provided')} value={provided}
          onChange={v=>onChange(kind, value, v)} />
      </RB.Col>
      {props.onDelete && <RB.Col>
        <RB.Button onClick={props.onDelete}>{L('act_remove')}</RB.Button>
      </RB.Col>}
    </RB.Row>
}

export function MultiResourceCostSelect(props: {value?: ResourceCostID[],
    className?: string, onChange: (values: ResourceCostID[])=>void}){
    const {value = [], onChange} = props
    const onDelete = (item: ResourceCost)=>onChange(value.filter(f=>f!=item))
    const onResChange = (res: ResourceCost, prev: ResourceCost)=>{
        const costs = [].concat.apply([], value)
        const cur = costs.find(p=>p===prev)
        Object.assign(cur, res)
        onChange(costs)
    }
    const list = value.map(o=><ResourceCostSelect key={`res_cost_select_${o._id}`}
        value={o} onChange={n=>onResChange(n, o)} onDelete={()=>onDelete(o)} />)
    return <RB.Container>
      {list}
    </RB.Container>
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

export function ModuleBoostsSelect(props: {value?: ModuleBoosts, onChange: (boosts: ModuleBoosts)=>void}){
    const [boosts, setBoosts] = React.useState(Object.assign({}, props.value))
    const [stat, setStat] = React.useState(null)
    const onChange = boosts=>{ setBoosts(boosts); props.onChange(boosts) }
    const setBoost = (k, v)=>onChange({...boosts, ...{[k]: v}})
    const addBoosts = ()=>onChange({[stat]: 0, ...props.value})
    const removeBoost = k=>{
        const obj = {...boosts}
        delete obj[k]
        onChange(obj)
    }
    const cols = Object.keys(boosts).map(k=><RB.Col><RB.Row>
      <RB.Col sm={1}>
        <RB.CloseButton onClick={()=>removeBoost(k)} />
      </RB.Col>
      <RB.Col>
        <NumberInput value={boosts[k]} onChange={v=>setBoost(k, v)}
          placeholder={L(`ship_stat_${ModStat[k].toLowerCase()}`)} />
      </RB.Col>
    </RB.Row></RB.Col>)
    return <RB.Row className='menu-list-row'>
      <RB.Col sm={2}>
        <ModStatSelect exclude={[ModStat.None].concat(Object.keys(props.value||{}).map(k=>+k))}
          value={stat} onChange={setStat} optonValue={(k=>ModStat[k].toLowerCase()) as any} />
      </RB.Col>
      <RB.Col sm={1}>
        <RB.Button disabled={stat===null} onClick={addBoosts}>{L('act_add')}</RB.Button>
      </RB.Col>
      {cols}
    </RB.Row>
}
import React from 'react'
import * as RB from 'react-bootstrap'
import {ItemType, ResourceType, PatentType, PatentWeight, MarketType} from '../common/entity'
import {ID, Location} from '../common/entity'
import {Select as USelect, TypedSelect} from '../util/select'
import {Select as PSelect} from '../map/List'
import {Select as CSelect} from '../corp/List'
import L from '../common/locale'
import * as _ from 'lodash'

export const ResourceSelect = TypedSelect(ResourceType, 'res_kind')
export const TypeSelect = TypedSelect(ItemType, 'item_type')
export const PatentTypeSelect = TypedSelect(PatentType, 'patent_type')
export const PatentWeightSelect = TypedSelect(PatentWeight, 'patent_weigth')


export function LocationSelect(props: {value?: Location, onChange: (loc: Location)=>void}){
    const {value} = props
    const [location, setLocation] = React.useState(value?._id||'')
    const [coord, setCoord] = React.useState(!value ? '' : `${value.pos.col}:${value.pos.row}`)
    const updateLocation = ()=>{
        const pos = coord?.split(':')
        props.onChange({_id: location, name: '', system: '',
            pos: {col: +pos[0], row: +pos[1]}})
    }
    const locChange = value=>{ setLocation(value); updateLocation() }
    const coordChange = ({target: {value}})=>{ setCoord(value); updateLocation() }
    return <RB.Container>
      <RB.Row><RB.Col>
        <PSelect value={location} onChange={locChange} optName='item_desc_location' />
      </RB.Col>
      <RB.Col>
        <RB.FormControl value={coord} onChange={coordChange}
            placeholder={L('loc_desc_coord')} />
      </RB.Col>
      </RB.Row>
    </RB.Container>
}

export function OwnerSelect(props: {value?: ID, onChange: (owner: ID)=>void}){
    const [owner, setOwner] = React.useState(props.value?._id)
    const ownerChange = (_id: string)=>{ setOwner(_id); props.onChange({_id, name: ''}) }
    return <CSelect value={owner} onChange={ownerChange} optName='item_desc_owner' />
}

export function MultiOwnerSelect(props: {value?: ID[], onChange: (owners: ID[])=>void}){
    const [owner, setOwner] = React.useState(null)
    const addOwner = ()=>owner && props.onChange(_.uniqBy([].concat(
        {_id: owner, name: ''}, props.value), f=>f._id).filter(Boolean))
    const removeOwner = (_id: string)=>props.onChange(_.uniqBy([].concat(
        props.value).filter(o=>o._id!=_id), f=>f._id).filter(Boolean))
    const owners = props.value?.map(o=><RB.Container key={`owner_${o._id}`}>
      <span>{o.name}</span><RB.Button onClick={()=>removeOwner(o._id)}>X</RB.Button>
    </RB.Container>)
    return <RB.Row>
      <RB.Col sm={2}>
        <OwnerSelect value={owner} onChange={setOwner} />
      </RB.Col>
      <RB.Col sm={1}>
        <RB.Button onClick={addOwner}>{L('act_add')}</RB.Button>
      </RB.Col>
      <RB.Col sm={9}>
        {owners}
      </RB.Col>
    </RB.Row>
}
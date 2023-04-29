import React from 'react'
import * as RB from 'react-bootstrap'
import {PlanetZone} from '../common/entity'
import {CoordinatesInput, NumberInput} from '../util/inputs'
import {default as L, LR} from './locale'

type PlanetZoneInputProps = {
    value?: PlanetZone
    onChange?: (l: PlanetZone)=>void
    onAdd?: (l: PlanetZone)=>void
    onRemove?: ()=>void
}
export function PlanetZoneInput(props: PlanetZoneInputProps){
    const [value, setValue] = React.useState(props.value)
    const update = (z: PlanetZone)=>{ setValue(z); props.onChange && props.onChange(z) }
    const coordChange = center=>update(Object.assign({}, value, {center}))
    const radiusChange = radius=>update(Object.assign({}, value, {radius}))
    const onAdd = ()=>{ 
      if (isNaN(+value?.center?.col) || isNaN(+value?.center?.row) || isNaN(+value?.radius))
        return
      props.onAdd(value)
      setValue(null)
    } 
    return <RB.Row>
      <RB.Col>
        <CoordinatesInput value={value?.center} onChange={coordChange} disabled={!value} />
      </RB.Col>
      <RB.Col>
        <NumberInput value={value?.radius} onChange={radiusChange}
          placeholder={L('desc_radius')} />
      </RB.Col>
      {props.onAdd && <RB.Col>
        <RB.Button onClick={onAdd}>{LR('act_add')}</RB.Button>
      </RB.Col>}
      {props.onRemove && <RB.Col>
        <RB.CloseButton onClick={props.onRemove} />
      </RB.Col>}
    </RB.Row>
}

type PlanetMultiZoneInput = {
    value: PlanetZone[]
    onChange: (l: PlanetZone[])=>void
}
export function PlanetMultiZoneInput(props: PlanetMultiZoneInput){
    const {value} = props
    const changeZone = (z, idx)=>{
        const val = [].concat(value).filter(Boolean)
        val[idx] = z
        props.onChange(val)
    }
    const addZone = (zone: PlanetZone)=>changeZone(zone, value?.length|0)
    const removeZone = idx=>props.onChange(value.filter(z=>z!==value[idx]))
    const list = value?.map((z, i)=><PlanetZoneInput key={`planet_zone_${JSON.stringify(z)}`}
        value={z} onChange={v=>changeZone(v, i)} onRemove={()=>removeZone(i)} />)
    return <RB.Container>
        <PlanetZoneInput onAdd={addZone} />
        {list}        
    </RB.Container>
}
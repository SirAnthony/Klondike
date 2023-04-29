import React from 'react'
import * as RB from 'react-bootstrap'
import {Institution, InstitutionType, Item} from '../common/entity'
import {Corporation, Planet} from '../common/entity'
import {TextInput, InstitutionTypeSelect, ResourceValueSelect, PlanetTypeSelect} from '../util/inputs'
import {NumberInput} from '../util/inputs'
import {ErrorMessage} from '../util/errors'
import {EditButtons} from '../util/buttons'
import {ApiStackError} from '../common/errors'
import {default as L, LR} from './locale'
import { PlanetMultiZoneInput } from './inputs'

type RowNewProps = {
    add?: boolean
    planet?: Planet
    err?: ApiStackError
    onCancel?: ()=>void
    onChange: (planet: Planet)=>void
}


export function PlanetRowEdit(props: RowNewProps){
    const {planet, onChange} = props
    const [type, setType] = React.useState(planet?.type)
    const [name, setName] = React.useState(planet?.name)
    const [system, setSystem] = React.useState(planet?.system)
    const [data, setData] = React.useState(planet?.data)
    const [zones, setZones] = React.useState(planet?.zones)
    const onSubmit = ()=>onChange({_id: planet?._id, type, name, system,
        data, zones})
    return <RB.InputGroup>
      <RB.Row className='menu-input-row'>
        {props.err && <ErrorMessage field={props.err} />}
        <RB.Col>
          <PlanetTypeSelect value={type} onChange={setType} />
        </RB.Col>
        <RB.Col>
          <TextInput value={name} onChange={setName}
            placeholder={LR('item_desc_name')} />
        </RB.Col>
        <RB.Col>
          <TextInput value={system} onChange={setSystem}
            placeholder={L('desc_system')} />
        </RB.Col>
        <RB.Col>
          <EditButtons {...props} onSubmit={onSubmit} />
        </RB.Col>
      </RB.Row>
      <RB.Row className='menu-input-row'>
        <RB.Col sm={6}>
          <TextInput as='textarea' rows={3} placeholder={LR('item_desc_data')}
            value={data} onChange={setData} />
        </RB.Col>
      </RB.Row>
      <RB.Row>
        <PlanetMultiZoneInput value={zones} onChange={setZones} />
      </RB.Row>
    </RB.InputGroup>
}
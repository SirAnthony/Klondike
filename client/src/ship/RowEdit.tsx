import React from 'react'
import * as RB from 'react-bootstrap'
import {InstitutionType, Ship} from '../common/entity'
import {TextInput, ShipClassSelect, OwnerSelect, LocationSelect} from '../util/inputs'
import {NumberInput} from '../util/inputs'
import {ErrorMessage} from '../util/errors'
import {ApiStackError} from '../common/errors'
import {default as L, LR} from './locale'

export type ShipSend = Omit<Ship, 'keys'|'class'>

type RowNewProps = {
    add?: boolean
    entity?: ShipSend
    err?: ApiStackError
    onCancel?: ()=>void
    onChange: (entity: ShipSend)=>void
}

export function ShipRowEdit(props: RowNewProps){
    const {entity, onChange, onCancel} = props
    const [name, setName] = React.useState(entity?.name)
    const [kind, setKind] = React.useState(entity?.kind)
    const [owner, setOwner] = React.useState(entity?.owner)
    const [location, setLocation] = React.useState(entity?.location)
    const [price, setPrice] = React.useState(entity?.price)
    const [port, setPort] = React.useState(entity?.port)
    const [captain, setCaptain] = React.useState(entity?.captain)
    const [integrity, setIntegrity] = React.useState(entity?.integrity)
    const [mass, setMass] = React.useState(entity?.mass)
    const [engine, setEngine] = React.useState(entity?.engine)
    const [speed, setSpeed] = React.useState(entity?.speed)
    const [movement, setMovement] = React.useState(entity?.movement)
    const [size, setSize] = React.useState(entity?.size)
    const [attack, setAttack] = React.useState(entity?.attack)
    const [defence, setDefence] = React.useState(entity?.defence)
    const [crew, setCrew] = React.useState(entity?.defence)
    const [slots, setSlots] = React.useState(entity?.slots)
    const [credit, setCredit] = React.useState(entity?.credit)
    const [cost, setCost] = React.useState(entity?.cost)
    const [data, setData] = React.useState(entity?.data)
    const onSubmit = ()=>onChange({_id: entity?._id, type: InstitutionType.Ship,
        name, kind, owner, location, price, port, captain, integrity, mass,
        engine, speed, movement, size, attack, defence, crew, slots, credit,
        cost, data})
    return <RB.InputGroup>
      <RB.Row className='menu-input-row'>
        {props.err && <ErrorMessage field={props.err} />}
        <RB.Col>
          <ShipClassSelect value={kind} onChange={setKind}
            exclude={[InstitutionType.User, InstitutionType.Ship]}/>
        </RB.Col>
        <RB.Col>
          <TextInput value={name} onChange={setName}
            placeholder={LR('item_desc_name')} />
        </RB.Col>
        <RB.Col>
          <TextInput value={port} onChange={setPort}
            placeholder={LR('ship_desc_port')} />
        </RB.Col>
        <RB.Col sm={4}>
          <RB.Button onClick={onSubmit}>{LR(props.add ? 'act_add' : 'act_save')}</RB.Button>
            {onCancel && <RB.Button onClick={onCancel}>{LR('act_cancel')}</RB.Button>}
        </RB.Col>
      </RB.Row>
      <RB.Row className='menu-input-row'>
        <RB.Col>
          <OwnerSelect value={owner} onChange={setOwner} />
        </RB.Col>
        <RB.Col>
          <OwnerSelect value={captain} onChange={setCaptain} exclude={[
            InstitutionType.Corporation, InstitutionType.Organization,
            InstitutionType.Research, InstitutionType.Ship
          ]} />
        </RB.Col>
        <RB.Col>
          <LocationSelect value={location} onChange={setLocation} />
        </RB.Col>
      </RB.Row>
      <RB.Row className='menu-input-row'>
        <RB.Col>
          <NumberInput value={integrity} onChange={setIntegrity}
            placeholder={LR('stat_integrity')} />
        </RB.Col>
        <RB.Col>
          <NumberInput value={mass} onChange={setMass}
            placeholder={LR('stat_mass')} />
        </RB.Col>
        <RB.Col>
          <NumberInput value={engine} onChange={setEngine}
            placeholder={LR('stat_engine')} />
        </RB.Col>
        <RB.Col>
          <NumberInput value={speed} onChange={setSpeed}
            placeholder={LR('stat_speed')} />
        </RB.Col>
        <RB.Col>
          <NumberInput value={movement} onChange={setMovement}
            placeholder={LR('stat_movement')} />
        </RB.Col>
        <RB.Col>
          <NumberInput value={size} onChange={setSize}
            placeholder={LR('stat_size')} />
        </RB.Col>
      </RB.Row>
      <RB.Row className='menu-input-row'>
        <RB.Col>
          <NumberInput value={attack} onChange={setAttack}
            placeholder={LR('stat_attack')} />
        </RB.Col>
        <RB.Col>
          <NumberInput value={defence} onChange={setDefence}
            placeholder={LR('stat_defence')} />
        </RB.Col>
        <RB.Col>
          <NumberInput value={crew} onChange={setCrew}
            placeholder={LR('stat_crew')} />
        </RB.Col>
        <RB.Col>
          <NumberInput value={slots} onChange={setSlots}
            placeholder={LR('stat_slots')} />
        </RB.Col>
      </RB.Row>
      <RB.Row className='menu-input-row'>
        <RB.Col sm={1}>
          {LR('entity_desc_credit')}
        </RB.Col>
        <RB.Col>
          <NumberInput value={credit} onChange={setCredit}
            placeholder={LR('entity_desc_credit')} />
        </RB.Col>
        <RB.Col sm={1}>
          {LR('entity_desc_cost')}
        </RB.Col>
        <RB.Col sm={2}>
          <NumberInput value={cost} onChange={setCost}
            placeholder={LR('entity_desc_cost')} />
        </RB.Col>
        <RB.Col sm={1}>
          {LR('item_desc_price')}
        </RB.Col>
        <RB.Col sm={2}>
          <NumberInput value={price} onChange={setPrice}
            placeholder={LR('item_desc_price')} />
        </RB.Col>
      </RB.Row>
      <RB.Row className='menu-input-row'>
        <RB.Col sm={6}>
          <TextInput as='textarea' rows={3} placeholder={LR('item_desc_data')}
            value={data} onChange={setData} />
        </RB.Col>
      </RB.Row>
    </RB.InputGroup>
}
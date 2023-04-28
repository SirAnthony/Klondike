import React from 'react'
import * as RB from 'react-bootstrap'
import {Institution, InstitutionType, Item} from '../common/entity'
import {Corporation} from '../common/entity'
import {TextInput, InstitutionTypeSelect, ResourceValueSelect} from '../util/inputs'
import {NumberInput} from '../util/inputs'
import {ErrorMessage} from '../util/errors'
import {ApiStackError} from '../common/errors'
import {default as L, LR} from './locale'

const TypeString = (t: InstitutionType = 0)=>InstitutionType[t].toLowerCase()

type RowNewProps = {
    add?: boolean
    entity?: Institution
    err?: ApiStackError
    onCancel?: ()=>void
    onChange: (entity: Institution)=>void
}

export function EntityRowEdit(props: RowNewProps){
    const {entity, onChange, onCancel} = props
    const [type, setType] = React.useState(entity?.type)
    const [name, setName] = React.useState(entity?.name)
    const [credit, setCredit] = React.useState(entity?.credit)
    const [cost, setCost] = React.useState(entity?.cost)
    const [data, setData] = React.useState(entity?.data)
    const [resourceValue, setResourceValue] =
        React.useState((entity as Corporation)?.resourceValue)
    const onSubmit = ()=>onChange({_id: entity?._id, type, name, credit, cost,
        data, resourceValue} as Corporation)
    const has = k=>(new (Institution.class(type)))?.keys.includes(k)
    return <RB.InputGroup>
      <RB.Row className='menu-input-row'>
        {props.err && <ErrorMessage field={props.err} />}
        <RB.Col>
          <InstitutionTypeSelect value={type} onChange={setType}
            exclude={[InstitutionType.User, InstitutionType.Ship]}/>
        </RB.Col>
        <RB.Col>
          <TextInput value={name} onChange={setName}
            placeholder={LR('item_desc_name')} />
        </RB.Col>
        <RB.Col sm={1}>
          {LR('entity_desc_credit')}
        </RB.Col>
        <RB.Col>
          <NumberInput value={credit} onChange={setCredit}
            placeholder={LR('currency')} />
        </RB.Col>
        <RB.Col sm={4}>
          <RB.Button onClick={onSubmit}>{LR(props.add ? 'act_add' : 'act_save')}</RB.Button>
            {onCancel && <RB.Button onClick={onCancel}>{LR('act_cancel')}</RB.Button>}
        </RB.Col>
      </RB.Row>
      {has('resourceValue') && <ResourceValueSelect value={resourceValue}
        onChange={setResourceValue} />}
      <RB.Row className='menu-input-row'>
        <RB.Col sm={6}>
          <TextInput as='textarea' rows={3} placeholder={LR('item_desc_data')}
            value={data} onChange={setData} />
        </RB.Col>
        <RB.Col sm={1}>
          {LR('entity_desc_cost')}
        </RB.Col>
        <RB.Col sm={2}>
          <NumberInput value={cost} onChange={setCost}
            placeholder={LR('currency')} />
        </RB.Col>
      </RB.Row>
    </RB.InputGroup>
}
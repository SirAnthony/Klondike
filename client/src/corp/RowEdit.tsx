import React from 'react'
import * as RB from 'react-bootstrap'
import {Institution, InstitutionType, ResourceValueInfo} from '../common/entity'
import {Corporation} from '../common/entity'
import {TextInput, InstitutionTypeSelect, ResourceValueSelect} from '../util/inputs'
import {ImageInput, NumberInput} from '../util/inputs'
import {ErrorMessage} from '../util/errors'
import {EditButtons} from '../util/buttons'
import {ApiStackError} from '../common/errors'
import {LR} from './locale'

export type InstitutionSave = {
    resourceValue?: ResourceValueInfo
    imgFile?: File
} & Omit<Institution, 'keys' | 'class'>

type RowNewProps = {
    add?: boolean
    entity?: InstitutionSave
    err?: ApiStackError
    onCancel?: ()=>void
    onChange: (entity: InstitutionSave)=>void
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
    const [imgFile, setImgFile] = React.useState(undefined)
    const onSubmit = ()=>onChange({_id: entity?._id, type, name,
      credit, cost, data, resourceValue, imgFile})
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
        <RB.Col>
          <NumberInput value={credit} onChange={setCredit}
            placeholder={LR('entity_desc_credit')} />
        </RB.Col>
        <RB.Col>
          <EditButtons {...props} onSubmit={onSubmit} />
        </RB.Col>
      </RB.Row>
      {has('resourceValue') && <ResourceValueSelect value={resourceValue}
        onChange={setResourceValue} />}
      <RB.Row className='menu-input-row'>
        <RB.Col sm={2}>
            <ImageInput source={entity as Institution} onChange={setImgFile} />
        </RB.Col>
        <RB.Col sm={6}>
          <TextInput as='textarea' rows={3} placeholder={LR('item_desc_data')}
            value={data} onChange={setData} />
        </RB.Col>
        <RB.Col sm={2}>
          <NumberInput value={cost} onChange={setCost}
            placeholder={LR('entity_desc_cost')} />
        </RB.Col>
      </RB.Row>
    </RB.InputGroup>
}
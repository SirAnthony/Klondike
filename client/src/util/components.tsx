import React from 'react'
import * as RB from 'react-bootstrap'
import {Item, ItemTypePrefix} from '../common/entity'

export function IDField(props: {item: Item}){
    const {item} = props
    const {_id, type} = item
    const str = [ItemTypePrefix[type], _id.slice(0, 6)].join('-')
    return <span className='field-id wrap-anywhere'>{str}</span>
}

export function Delimeter(){
    return <hr className='delimeter' />
}
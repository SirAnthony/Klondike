import React from 'react';
import * as util from '../common/util'
import * as CError from '../common/errors'
import L from '../common/locale'

export function ErrorMessage(props: {field: CError.ApiStackError | CError.ApiStackError[], className?: string}){
    const field: CError.ApiStackError | CError.ApiStackError[] = props.field
    if (!field)
        return null
    if (Array.isArray(field)) {
        const list = field.map((f, i)=>
            <li key={`err_${i}`}><ErrorMessage field={f} /></li>)
        return <ul>{list}</ul>
    }
    const cls = util.array_join(['error', props.className])
    return <span className={cls}>{L(field.message)}</span>
}
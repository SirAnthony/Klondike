import React from 'react'
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import {ErrorMessage} from './errors'
import {ID} from '../common/entity'
import L from '../common/locale'

type SelectState = {
    value: any
    list?: any[]
    options: {[key: string]: string | ID}
}
type SelectProps = {
    value?: any
    optName?: string
    disabled?: boolean
    filter?: (item: any)=>Boolean
    onChange: (value: any)=>void
}
export class Select<P, S> extends F.Fetcher<P & SelectProps, S & SelectState> {
    L: (string)=>string
    top_enabled = false
    constructor(props){
        super(props)
        this.state = {value: props.value} as any
        this.onChange = this.onChange.bind(this)
    }
    get optName(){ return 'default_choise' }
    get defaultValue(){ return `default_value_opt` }
    fetchState(data: any = {}){
        const {list} = data
        return {item: data, list, options: this.getOptions(list)}
    }
    getOptions(list: any[] = []){
        return {}
    }
    getOptionValue(opt) : String { 
        return typeof opt=='string' ? opt : opt.name }
    getValue(value){ return value }
    onChange({target: {value}}){
        this.setState({value})
        this.props.onChange(this.getValue(value))
    }
    body(): JSX.Element[] {
        const {options} = this.state
        const {optName} = this.props
        const opts = Object.keys(options).map(o=>{
            const opt = options[o];
            const id = typeof opt=='string' ? o : opt._id
            const name = this.getOptionValue(opt)
            return <option key={`opt_${id}_${o}`} value={id}>{name}</option>
        })
        opts.unshift(<option key={`opt_name`} disabled={!this.top_enabled}
            value={this.defaultValue}>{this.L(optName||this.optName)}</option>)
        return opts
    }
    render(){
        const {list, err} = this.state
        if (err)
            return <ErrorMessage field={err} />
        if (!list)
            return <div>{this.L('not_found')}</div>
        let value = this.state.value
        if (value===null||value===undefined)
            value = this.defaultValue
        const body = this.body()
        return <RB.FormSelect value={value} onChange={this.onChange} disabled={this.props.disabled}>
          {body}
        </RB.FormSelect>
    }
}

export function TypedSelect<T>(TO: T, key: string, opt: string, top_enabled?: boolean){
    return class TypedSelect extends Select<{exclude?: (number | string)[], title?: string}, {}> {
        L = L
        top_enabled = top_enabled
        get optName(){ return this.props.title || opt }
        getValue(value){ return +value }
        async fetch(){
            const keys = Object.keys(TO)
            const numeric = keys.filter(k=>!isNaN(+k))
            const arr = numeric.length ? numeric : keys
            const list = arr.filter(k=>!this.props.exclude?.includes(numeric.length ? +k : k))
            this.setState(this.fetchState({list}))
        }
        getOptions(list: T[]){
            return list.reduce((p, v)=>
                Object.assign(p, {[v as string]: key ? L(`${key}_${v}`) : v }), {}) || []
        }
        componentDidUpdate(prevProps){
            if (prevProps.exclude!==this.props.exclude)
                this.fetch()
        }
    }
}
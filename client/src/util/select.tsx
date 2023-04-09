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
    value: any
    optName?: string
    disabled?: boolean
    filter?: (item: any)=>Boolean
    onChange: (value: any)=>void
}
export class Select<P, S> extends F.Fetcher<P & SelectProps, S & SelectState> {
    L: (string)=>string
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
            const name = typeof opt=='string' ? opt : opt.name
            return <option key={`opt_${id}_${o}`} value={id}>{name}</option>
        })
        opts.unshift(<option key={`opt_name`} disabled={true} value={this.defaultValue}>
            {this.L(optName||this.optName)}</option>)
        return opts
    }
    render(){
        const {list, err} = this.state
        if (err)
            return <ErrorMessage field={err} />
        if (!list)
            return <div key={'list_empty'}>{this.L('not_found')}</div>
        let value = this.state.value
        if (value===null||value===undefined)
            value = this.defaultValue
        const body = this.body()
        return <RB.FormSelect value={value} onChange={this.onChange} disabled={this.props.disabled}>
          {body}
        </RB.FormSelect>
    }
}

export function TypedSelect<T>(T: T, key: string, opt: string){
    return class TypedSelect extends Select<{exclude?: number[]}, {}> {
        L = L
        get optName(){ return opt }
        getValue(value){ return +value }
        async fetch(){
            const list = Object.keys(T).filter(k=>
                !isNaN(+k) && !this.props.exclude?.includes(+(k)))
            this.setState(this.fetchState({list}))
        }
        getOptions(list: T[]){
            return list.reduce((p, v)=>
                Object.assign(p, {[v as string]: L(`${key}_${v}`)}), {}) || []
        }
        componentDidUpdate(prevProps){
            if (prevProps.exclude!=this.props.exclude)
                this.fetch()
        }
    }
}
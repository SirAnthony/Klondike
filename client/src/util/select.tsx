import React from 'react'
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import {ErrorMessage} from './errors'
import L from '../common/locale'

type SelectState = {
    value: any
    list?: any[]
    options: {[key: string]: string}
}
type SelectProps = {
    value: any
    optName: string
    onChange: (value: any)=>void
}
export class Select<P, S> extends F.Fetcher<P & SelectProps, S & SelectState> {
    L: (string)=>string
    constructor(props){
        super(props)
        this.state = {value: props.value} as any
        this.onChange = this.onChange.bind(this)
    }
    fetchState(data: any = {}){
        const {list} = data
        return {item: data, list, options: this.getOptions(list)}
    }
    getOptions(list: any[] = []){
        return {}
    }
    onChange({target: {value}}){
        this.setState({value})
        this.props.onChange(value)
    }
    body(): JSX.Element[] {
        const {optName} = this.props
        const {options} = this.state
        const opts = Object.keys(options).map(o=>
          <option key={`opt_${options[o]}_${o}`} value={o}>{options[o]}</option>)
        opts.unshift(<option key={`opt_name`} disabled={true} value=''>
            {this.L(optName)}</option>)
        return opts
    }
    render(){
        const {list, err, value} = this.state
        if (err)
            return <ErrorMessage field={err} />
        if (!list)
            return <div key={'list_empty'}>{this.L('not_found')}</div>
        const body = this.body()
        return <RB.FormSelect value={value} onChange={this.onChange}>
          {body}
        </RB.FormSelect>
    }
}
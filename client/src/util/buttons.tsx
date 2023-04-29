import React from 'react'
import * as RR from 'react-router-dom'
import * as RB from 'react-bootstrap'
import L from '../common/locale'

export function CloseButton(props: {to?: string, onClose?: ()=>void}){
    const nav = RR.useNavigate()
    const {to = props.to||'/', onClose} = props
    const close = onClose ? onClose : ()=>nav(to)
    return <RB.CloseButton onClick={close}></RB.CloseButton>
}

export function PopupButton(props: {url: string, desc: string, opt?: any}){
    const opt = Object.assign({width: 500, height: 500, scrollbar: 'no', resizable: 'no'}, props.opt)
    const onClick = ()=>{
        const opt_str = Object.keys(opt).map(c=>`${c}=${opt[c]}`).join(',')
        window.open(props.url, 'popup', opt_str)
        return false
    }
    return <RB.Button onClick={onClick}>{props.desc}</RB.Button>
}

export function DataViewerButtons(props: {show: boolean,
    onShow: (v: boolean)=>void, onEdit: (v: boolean)=>void}){
    const {show, onShow, onEdit} = props
    return <RB.Col>
      <RB.Button onClick={()=>onShow(!show)}>{L('act_show_data')}</RB.Button>
      <RB.Button onClick={()=>onEdit(true)}>{L('act_edit')}</RB.Button>
    </RB.Col>
}

export function EditButtons(props: {onCancel?: ()=>void, onSubmit: (v: any)=>void, add?: boolean}){
    const {add, onCancel, onSubmit} = props
    return <RB.Container className='btn-box'><RB.Row className='justify-content-end'>
      <RB.Col sm={6}>
        <RB.Button onClick={onSubmit}>{L(props.add ? 'act_add' : 'act_save')}</RB.Button>
      </RB.Col>
      {onCancel && <RB.Col sm={6}>
        <RB.Button onClick={onCancel}>{L('act_cancel')}</RB.Button>
      </RB.Col>}
    </RB.Row></RB.Container>
}
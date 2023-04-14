import React from 'react'
import * as RR from 'react-router-dom'
import * as RB from 'react-bootstrap'

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
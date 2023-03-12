import React from 'react'
import * as RR from 'react-router-dom'
import * as RB from 'react-bootstrap'

export function CloseButton(props: {to?: string, onClose?: ()=>void}){
    const nav = RR.useNavigate()
    const {to = props.to||'/', onClose} = props
    const close = onClose ? onClose : ()=>nav(to)
    return <RB.CloseButton onClick={close}></RB.CloseButton>
}
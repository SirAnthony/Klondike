import React from 'react'
import * as RR from 'react-router-dom'
import * as RB from 'react-bootstrap'

export function CloseButton(props: {to?: string}){
    const nav = RR.useNavigate()
    const {to = '/'} = props
    const close = ()=>nav(to)
    return <RB.CloseButton onClick={close}></RB.CloseButton>
}
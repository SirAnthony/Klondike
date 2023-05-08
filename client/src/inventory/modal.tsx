import React from 'react'
import * as RB from 'react-bootstrap'
import {ApiError} from '../common/errors'
import L from './locale'
import { ErrorMessage } from 'src/util/errors'

type ModalProps = {
    title?: string
    children?: React.ReactNode
    show?: boolean
    err?: ApiError
    onAgree: ()=>void
    onReject?: ()=>void
}
export function Modal(props: ModalProps){
    const {title, children, show, err, onAgree, onReject} = props
    return <RB.Modal show={show} onHide={onReject}>
      <RB.ModalHeader closeButton>
        <RB.ModalTitle>{title||L('confirmation_needed')}</RB.ModalTitle>
      </RB.ModalHeader>
      <RB.ModalBody>
        {err && <ErrorMessage field={err} />}
        {children}
      </RB.ModalBody>
      <RB.ModalFooter>
        {onReject && <RB.Button onClick={onReject}>{L('act_disagree')}</RB.Button>}
        <RB.Button disabled={!!err} onClick={onAgree}>{L('act_agree')}</RB.Button>
      </RB.ModalFooter>
    </RB.Modal>
}

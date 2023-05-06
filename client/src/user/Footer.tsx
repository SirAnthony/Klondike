import React from 'react';
import * as RB from 'react-bootstrap'
import * as RR from 'react-router-dom'
import {User, InstitutionType, UserTypeIn, UserType, Owner} from '../common/entity'
import {ButtonNavigator} from '../admin';
import {default as L} from './locale'
import { Delimeter } from 'src/util/components';

export type FooterProps = {
    user: User
}

function Button(props: FooterProps & {type: string, relation: Owner}){
    const {relation, type} = props
    return <RB.Button>
      <RB.NavLink href={`/${type}/${relation?.type}/${relation?._id}`}>
        {L(`pane_${type}`)}
      </RB.NavLink>
    </RB.Button>
}

function Pane(props: FooterProps & {relation: Owner, buttons: string[], eventKey: string}){
    const cols = props.buttons.map(b=><RB.Col key={`pane_button_${b}`}>
      <Button {...props} type={b} relation={props.relation} /></RB.Col>)
    return <RB.TabPane eventKey={props.eventKey}><RB.Row>
      {cols}
    </RB.Row></RB.TabPane>
}

function AddButtons(user: User){
    const buttons = []
    if (UserTypeIn(user, UserType.Master | UserType.GuardFine))
        buttons.unshift('fines')
    if (UserTypeIn(user, UserType.Master | UserType.GuardFine))
        buttons.unshift('flights')
    return buttons
}

function EntityPane(props: FooterProps){
    const {user} = props
    const relation = user.relation||user
    const sp = s=>s.split(' ')
    const buttons = {
      [InstitutionType.User]: sp('inventory'),
      [InstitutionType.Corporation]: sp('inventory maps'),
      [InstitutionType.Organization]: sp('inventory'),
      [InstitutionType.Research]: sp('flights inventory maps'),
      [InstitutionType.Ship]: sp('flights inventory maps ship log'),
    }
    const arr = [...new Set([...AddButtons(user), ...buttons[+relation.type]])]
    return <Pane {...props} eventKey='entity' relation={relation}
      buttons={buttons[+relation.type]} />
}

function ProfilePane(props: FooterProps){
    const {user} = props
    const buttons = [...AddButtons(user), 'inventory']
    return <Pane {...props} eventKey='profile' relation={user} buttons={buttons} />
}

export function UserFooter(props: FooterProps){
    const location = RR.useLocation()
    const {user} = props
    const {relation} = user||{}
    const tab = location.pathname.startsWith('/profile') ? 'profile' : 'entity'
    return <RB.Container className='app-footer'>
    <RB.TabContainer defaultActiveKey={tab}><RB.Row>
      <RB.Nav variant='tabs' defaultActiveKey={tab}>
        {relation && <RB.Col><RB.NavItem>
          <RB.NavLink eventKey='entity' href={`/inventory/${relation?.type}/${relation?._id}`}>
            {L(`tab_entity_${relation.type}`, relation?.name)}
          </RB.NavLink>
        </RB.NavItem></RB.Col>}
        <RB.Col><RB.NavItem>
          <RB.NavLink eventKey='profile' href={`/profile/${user?._id}`}>
            {L(`tab_entity_${InstitutionType.User}`)}
          </RB.NavLink>
        </RB.NavItem></RB.Col>
      </RB.Nav>
    </RB.Row><RB.Row className='footer-tab'>
      <RB.Col><RB.TabContent>
        <EntityPane {...props} />
        <ProfilePane {...props} />
        {user.admin && <RB.Row>
          <Delimeter />
          <ButtonNavigator {...props} />
        </RB.Row>}
      </RB.TabContent></RB.Col>
    </RB.Row></RB.TabContainer>
    </RB.Container>
}
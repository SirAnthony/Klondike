import React from 'react';
import * as RB from 'react-bootstrap'
import * as RR from 'react-router-dom'
import {User, InstitutionType} from '../common/entity'
import {ButtonNavigator} from '../admin';
import {default as L} from './locale'
import { Delimeter } from 'src/util/components';

export type FooterProps = {
    user: User
}

function Button(props: FooterProps & {type: string}){
    const {user, type} = props
    const {relation} = user
    return <RB.Button>
      <RB.NavLink href={`/${type}/${relation.type}/${relation._id}`}>
        {L(`pane_${type}`)}
      </RB.NavLink>
    </RB.Button>
}

function EntityPane(props: FooterProps){
    const {user} = props
    const {relation} = user
    const sp = s=>s.split(' ')
    const buttons = {
      [InstitutionType.Corporation]: sp('inventory maps'),
      [InstitutionType.Organization]: sp('inventory'),
      [InstitutionType.Research]: sp('flights inventory maps'),
      [InstitutionType.Ship]: sp('flights inventory maps ship log'),
    }
    const cols = buttons[relation.type].map(b=><RB.Col key={`pane_button_${b}`}>
      <Button {...props} type={b} /></RB.Col>)
    return <RB.TabPane eventKey='entity'><RB.Row>
      {cols}
    </RB.Row></RB.TabPane>
}

function ProfilePane(props: FooterProps){
    return <RB.TabPane eventKey='profile'><RB.Row>
      <RB.Col><RB.Button>Personal</RB.Button></RB.Col>
    </RB.Row></RB.TabPane>
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
        {relation && <EntityPane {...props} />}
        <ProfilePane {...props} />
        {user.admin && <RB.Row>
          <Delimeter />
          <ButtonNavigator {...props} />
        </RB.Row>}
      </RB.TabContent></RB.Col>
    </RB.Row></RB.TabContainer>
    </RB.Container>
}
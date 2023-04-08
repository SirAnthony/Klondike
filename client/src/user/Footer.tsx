import React from 'react';
import * as RB from 'react-bootstrap'
import * as RR from 'react-router-dom'
import * as F from '../Fetcher'
import {User, UserRelationType, ID} from '../common/entity'
import {default as L, LR} from './locale'

export type FooterProps = {
    user: User
}

function CorpPane(props: FooterProps){
    return <RB.TabPane eventKey='corp'><RB.Row>
      <RB.Col><RB.Button>{L('pane_inventory')}</RB.Button></RB.Col>
      <RB.Col><RB.Button>{L('pane_maps')}</RB.Button></RB.Col>
    </RB.Row>
    </RB.TabPane>
}

function ShipPane(props: FooterProps){
    return <RB.TabPane eventKey='ship'><RB.Row>
      <RB.Col><RB.Button>{L('pane_fligth_table')}</RB.Button></RB.Col>
      <RB.Col><RB.Button>{L('pane_inventory')}</RB.Button></RB.Col>
      <RB.Col><RB.Button>{L('pane_maps')}</RB.Button></RB.Col>
      <RB.Col><RB.Button>{L('pane_ship')}</RB.Button></RB.Col>
      <RB.Col><RB.Button>{L('pane_log')}</RB.Button></RB.Col>
    </RB.Row></RB.TabPane>
}

function PersonalPane(props: FooterProps){
    return <RB.TabPane eventKey='personal'><RB.Row>
      <RB.Col><RB.Button>Personal</RB.Button></RB.Col>
    </RB.Row></RB.TabPane>
}


export function UserFooter(props: FooterProps){
    const location = RR.useLocation()
    const {user} = props
    const {relation} = user||{}
    const has = (r: UserRelationType)=>user?.admin || r==relation?.type
    const tab = location.pathname.startsWith('/ship') ? 'ship' :
        location.pathname.startsWith('/corp') ? 'corp' : 'personal'
    return <RB.Container className='app-footer'>
    <RB.TabContainer defaultActiveKey={tab}><RB.Row>
      <RB.Nav variant='tabs' defaultActiveKey={tab}>
        {has(UserRelationType.Corporation) && <RB.Col><RB.NavItem>
          <RB.NavLink eventKey='corp' href={`/corp/${relation?.entity._id}`}>
            {L('tab_corporation', relation?.entity.name)}
          </RB.NavLink>
        </RB.NavItem></RB.Col>}
        {has(UserRelationType.Ship) && <RB.Col><RB.NavItem>
          <RB.NavLink eventKey='ship' href={`/ship/${relation?.entity._id}`}>
            {L('tab_ship', relation?.entity.name)}
          </RB.NavLink>
        </RB.NavItem></RB.Col>}
        <RB.Col><RB.NavItem>
          <RB.NavLink eventKey='personal' href={`/user/${user?._id}`}>
            {L('tab_cabinet')}
          </RB.NavLink>
        </RB.NavItem></RB.Col>
      </RB.Nav>
    </RB.Row><RB.Row className='footer-tab'>
      <RB.Col><RB.TabContent>
        <CorpPane {...props} />
        <ShipPane {...props} />
        <PersonalPane {...props} />
      </RB.TabContent></RB.Col>
    </RB.Row></RB.TabContainer>
    </RB.Container>
}
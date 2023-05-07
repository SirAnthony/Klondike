import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import {Institution, InstitutionType, User} from "../common/entity"
import {ControlBar} from '../util/controls'
import {ItemDetails, OrderDetails, ProposalDetails} from './Details'
import {PatentDetails} from './Details'
import {RatingDetails} from '../corp/Rating'
import {PriceDetails, BudgetDetails} from '../inventory'
import {default as L} from './locale'

type InstitutionProps = {
    entity: Institution
    user: User
}

export function EntityInventory(props: InstitutionProps){
    const {entity, user} = props
    const param = {owner: entity, ...props}
    return <RB.Container className='container-fit'>
      <RB.Row>
        <RB.Col className='menu-list-title'>{entity.name}</RB.Col>
      </RB.Row>
      <RB.Row>
        <RB.Col className='menu-box-col'><RB.Container>
          <RB.Row>
            <BudgetDetails {...param} />
          </RB.Row>
          <RB.Row><RB.Col className='menu-box menu-box-col'>
            <PriceDetails {...param} />
          </RB.Col></RB.Row>
          {+entity.type===InstitutionType.Corporation && <RB.Row>
            <RB.Col className='menu-box menu-box-col'>
              <RatingDetails />
            </RB.Col>
          </RB.Row>}
        </RB.Container></RB.Col>
        <RB.Col className='menu-box-view' ><RB.Container>
          {+entity.type===InstitutionType.Corporation && <RB.Row>
            <RB.Col className='menu-box'>
              <OrderDetails {...param} fields={['plan']} />
            </RB.Col>
          </RB.Row>}
          <ProposalDetails asBox={true} {...param} />
          {+entity.type===InstitutionType.Research &&
            <PatentDetails {...param} asBox={true} />}
          <ItemDetails {...param} asBox={true} />
          {+entity.type!==InstitutionType.Research && 
            <PatentDetails {...param} asBox={true} />}
        </RB.Container></RB.Col>
      </RB.Row>
    </RB.Container>
}

type InventoryDetailsState = {
    entity?: Institution 
}

type InventoryDetailsProp = {
    user: User
    type?: InstitutionType
    id?: string
    onClose?: ()=>void
}

export default class InventoryDetails extends F.Fetcher<InventoryDetailsProp, InventoryDetailsState> {
    constructor(props){
        super(props)
        this.state = {}
    }
    get fetchUrl(){
        const {type, id = ''} = this.props
        return `/api/inventory/${type}/${id}`
    }
    fetchState(data: any = {}){
        const {entity} = data
        return {item: data, entity}
    }
    view(){
        const {entity} = this.state
        if (!entity)
            return <div>{L('not_found')}</div>
        return <EntityInventory entity={entity} user={this.props.user} />
    }
    render(){
        const {entity} = this.state
        return <RB.Container className="menu-container-fit">
          <ControlBar title={L('interface', entity?.name||'')} onClose={this.props.onClose} />
          {this.view()}
        </RB.Container>
    }
}
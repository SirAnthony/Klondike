import React from 'react'
import * as RB from 'react-bootstrap'
import {Institution, Owner, User, ID} from '../common/entity'
import {Delimeter} from '../util/components'
import {NumberInput, OwnerSelect} from '../util/inputs'
import {ErrorMessage} from '../util/errors'
import {ClientError} from '../common/errors'
import {InventoryEvents, TimeDetails} from '../inventory'
import * as F from '../Fetcher'
import {default as L, LR} from './locale'
import * as util from '../common/util'
import * as date from '../common/date'
import * as _ from 'lodash'

type RatingDetailsState = {
    rating: {
        cycle: number,
        owner: Owner,
        value: number
    }[][],
    cycle: number
}
type RatingDetailsProps = {}
export class RatingDetails extends F.Fetcher<RatingDetailsProps, RatingDetailsState> {
    constructor(props){
        super(props)
        this.state = {rating: [], cycle: TimeDetails.Time.cycle|0}
        InventoryEvents.onreloadRating(()=>this.fetch())
        InventoryEvents.onreloadTime(()=>
            this.setState({cycle: TimeDetails.Time.cycle}))
    }
    get fetchUrl(){ return '/api/corp/rating' }
    fetchState(data: any){
        return {item: data, rating: data?.rating}
    }
    body(){
        const {rating} = this.state
        const corps = Object.keys(rating?.flat().map(f=>f.owner.name)
            .reduce((p, c)=>{ p[c] = 1; return p }, {})||{}).sort();
        const rows = []
        for (let k=0; k<rating.length; k++){
            const cols = [<td>{`C${k+1}`}</td>]
            for (let c of rating[k])
                cols.push(<td>{c.value}</td>)
            rows.push(<tr>{cols}</tr>)
        }
        return <tbody>{rows}</tbody>
    }
    title(){
        const {rating} = this.state
        const cols = [<th></th>]
        const corps = Object.keys(rating?.flat().map(f=>f.owner.name)
            .reduce((p, c)=>{ p[c] = 1; return p }, {})||{}).sort();
        for (let k of corps)
            cols.push(<th><span>{k}</span></th>)
        return <thead>
          <tr>{cols}</tr>
        </thead>
    }
    render(){
        const {rating, cycle} = this.state
        return <RB.Container>
          <RB.Row className='menu-list-title'><RB.Col>
            {L('corporations_rating')}
          </RB.Col></RB.Row>
          <Delimeter />
          <table className='menu-table-rating'>
            {this.title()}
            {this.body()}
          </table>
        </RB.Container>
    }
}
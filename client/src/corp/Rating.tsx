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
    }[],
    cycle: number
}
type RatingDetailsProps = {}
export class RatingDetails extends F.Fetcher<RatingDetailsProps, RatingDetailsState> {
    constructor(props){
        super(props)
        this.state = {rating: [], cycle: 0}
        InventoryEvents.onreloadRating(()=>this.fetch())
        InventoryEvents.onreloadTime(()=>
            this.setState({cycle: TimeDetails.Time.cycle}))
    }
    get fetchUrl(){ return '/api/corp/rating' }
    fetchState(data: any){
        return {item: data, rating: data.rating}
    }
    body(columns: number){
        const {rating} = this.state
        const ratings = _.groupBy(rating, ({owner})=>owner.name)
        const rows = []
        for (let k of Object.keys(ratings).sort()){
            const r = _.groupBy(ratings[k], ({cycle})=>cycle)
            const cols = Array(columns+1)
            cols[0] = <td>{ratings[k][0]?.owner?.name}</td>
            for (let i=1; i<=columns; i++)
                cols[i] = <td>{r[i][0].value}</td>
            rows.push(<tr>{cols}</tr>)
        }
        return <tbody>{rows}</tbody>
    }
    title(columns: number){
        const cols = []
        for (let i=0; i<=columns; i++)
            cols.push(<th>{i ? `C${i}` : ''}</th>)
        return <thead>
          {cols}
        </thead>
    }
    render(){
        const {rating, cycle} = this.state
        const max = rating.reduce((p, c)=>Math.max(c.cycle|0, p|0), cycle)
        return <RB.Container>
          <RB.Row className='menu-list-title'><RB.Col>
            {L('corporations_rating')}
          </RB.Col></RB.Row>
          <Delimeter />
          <table>
            {this.title(max)}
            {this.body(max)}
          </table>
        </RB.Container>
    }
}
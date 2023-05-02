import React from 'react'
import * as RB from 'react-bootstrap'
import {Owner} from '../common/entity'
import {Delimeter} from '../util/components'
import {InventoryEvents, TimeDetails} from '../inventory'
import * as F from '../Fetcher'
import {default as L} from './locale'

type ServerRating = {
    cycle: number,
    owner: Owner,
    points: number
}[]

type RatingDetailsState = {
    rating: [string|number][],
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
        const rating = this.getTableData(data?.rating)
        return {item: data, rating}
    }
    getTableData(rating: ServerRating){
        if (!rating)
            return null
        const owners = [...new Set(rating.map(e=>e.owner.name))].sort()
        const ret = [owners]
        const rows = rating.reduce((p, c)=>{
            p[c.cycle] = p[c.cycle]||{}
            p[c.cycle][c.owner.name] = c.points;
            return p;
        }, {});
        for (let k of Object.keys(rows).sort())
            ret.push(owners.map(o=>rows[k][o]))
        return ret
    }
    body(){
        const {rating, cycle} = this.state
        const data = rating.slice(1)||[]
        const rows = [], total = []
        for (let k=0; k<cycle-1; k++){
            const row = (data[k]||[]) as [number]
            const cols = [<td>{`C${k+1}`}</td>].concat(
                row.map(r=><td>{r}</td>))
            rows.push(<tr>{cols}</tr>)
            for (let p=0; p<row.length; p++)
                total[p] = (total[p]|0)+row[p]
        }
        rows.push(<tr>
            <td>{`C${cycle}`}</td>
            {total.map(t=><td></td>)}
        </tr>)
        if (rows.length>2){
            rows.push(<tr>
                <td>{L('rating_total')}</td>
                {total.map(t=><td>{t}</td>)}
            </tr>)
        }
        return <tbody>{rows}</tbody>
    }
    title(){
        const {rating} = this.state
        const header = rating[0]||[]
        const cols = [<th></th>]
        for (let k of header)
            cols.push(<th><span>{k}</span></th>)
        return <thead>
          <tr>{cols}</tr>
        </thead>
    }
    render(){
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
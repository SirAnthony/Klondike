import React from 'react';
import * as RR from 'react-router-dom'
import * as F from '../Fetcher'
import L from './locale'
import {Planet, User} from '../common/entity'
import {Stage, Layer, RegularPolygon, Shape} from 'react-konva'

const RADIUS = 25, COUNTW = 29, COUNTH = 20
const HEX_BORDER_COLOR = '#005f9f', HEX_FILL_COLOR = '#488'

type Point = {
    x: number
    y: number
}

class Pos {
    col: number
    row: number
    constructor(c, r){
        this.col = c
        this.row = r
    }
    get canvas(): Point {
        const x = RADIUS * (1 + Math.sqrt(3) * (this.col + 0.5*(this.row&1)))
        const y = RADIUS * (1 + 3/2 * this.row)
        return {x, y}
    }
}

function Hexagon(props: {pos: Pos}){
    const [fill, setFill] = React.useState(false)
    const {pos} = props
    const point = pos.canvas
    return <RegularPolygon sides={6} radius={RADIUS} x={point.x} y={point.y} 
      onMouseLeave={()=>setFill(false)} onMouseOver={()=>setFill(true)}
      stroke={HEX_BORDER_COLOR} fill={fill ? HEX_FILL_COLOR : undefined}
      strokeWidth={1}/>
}

function HexLayer(props){
    const hexes = []
    for (let col=0; col<COUNTW; col++)
        for (let row=0; row<COUNTH; row++)
            hexes.push(<Hexagon key={`${col}:${row}`} pos={new Pos(col, row)} />)
    return <Layer>{hexes}</Layer>
}

type PlanetState = {
    id: string
    planet?: Planet
}
type PlanetProps = {
    user: User
    params: RR.Params
}

class MapView extends F.Fetcher<PlanetProps, PlanetState> {
    constructor(props){
        super(props)
        this.state = {id: props.params.id}
    }
    get fetchUrl() {
        const {id} = this.state
        return `/api/planet/${id}`
    }
    fetchState(data: any){
        const {planet} = data
        return {item: data, planet}
    }
    render() {
        const {planet} = this.state
        if (!planet)
            return <div>{L('not_found')}</div>
        const width = RADIUS*COUNTW*2+1, height=RADIUS*(COUNTH*3/2+0.5)+1
        return <Stage width={width} height={height} className="map">
          <HexLayer />
        </Stage>
    }
}

export function Navigator(props){
    const params = RR.useParams()
    return <MapView user={props.user} params={params} />
}
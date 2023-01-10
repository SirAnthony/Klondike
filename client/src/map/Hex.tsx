import React from 'react';
import {Layer, RegularPolygon, Text} from 'react-konva'
import {Pos} from './util'
import defines from '../common/defines'

function Hexagon(props: {pos: Pos}){
    const [fill, setFill] = React.useState(false)
    const {pos} = props
    const point = pos.canvas
    const {radius, colors} = defines.map
    const {x, y} = point
    const text = <Text text={`${pos.col}:${pos.row}`} fontSize={12}
        stroke={'#0f0'} x={x-radius/2} y={y-radius/4} />
    return <div>
      <RegularPolygon sides={6} radius={radius} x={x} y={y} 
      onMouseLeave={()=>setFill(false)} onMouseOver={()=>setFill(true)}
      stroke={colors.hex_border} fill={fill ? colors.hex_fill : undefined}
      strokeWidth={1} />
      {fill && text}
    </div>
}

export function HexLayer(props){
    const hexes = []
    const {countw, counth} = defines.map
    for (let col=0; col<countw; col++)
        for (let row=0; row<counth; row++)
            hexes.push(<Hexagon key={`${col}:${row}`} pos={new Pos(col, row)} />)
    return <Layer>{hexes}</Layer>
}
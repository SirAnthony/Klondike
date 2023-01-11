import React from 'react';
import {Layer, RegularPolygon, Text, Group} from 'react-konva'
import {Pos} from './util'
import defines from '../common/defines'

function Hexagon(props: {pos: Pos}){
    const [fill, setFill] = React.useState(false)
    const {pos} = props
    const point = pos.canvas
    const {radius, colors} = defines.map
    const {x, y} = point
    const text = <Text text={`${pos.col}:${pos.row}`} fontSize={12}
        fill={'#0f0'} x={x-radius/2} y={y-radius/4} />
    return <Group>
      <RegularPolygon sides={6} radius={radius} x={x} y={y} 
      onMouseLeave={()=>setFill(false)} onMouseOver={()=>setFill(true)}
      stroke={colors.hex_border} fill={fill ? colors.hex_fill : undefined}
      strokeWidth={1} />
      {fill && text}
    </Group>
}

export function HexLayer(props){
    const hexes = []
    const {size, radius} = defines.map
    const countw = Math.floor(size.width/radius/Math.sqrt(3))
    const counth = Math.floor(size.height/radius*2/3)
    for (let col=0; col<countw; col++)
        for (let row=0; row<counth; row++)
            hexes.push(<Hexagon key={`${col}:${row}`} pos={new Pos(col, row)} />)
    return <Layer>{hexes}</Layer>
}
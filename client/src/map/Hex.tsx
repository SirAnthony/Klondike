import React from 'react';
import {Layer, RegularPolygon, Text, Group, Image as KImage} from 'react-konva'
import {Pos} from './util'
import defines from '../common/defines'
import {Item, PlanetInfo, PlanetShip, Pos as EPos} from '../common/entity';
import useImage from 'use-image';
import * as urls from '../common/urls'

type HoverProps = {
    onMouseLeave: ()=>void
    onMouseOver: ()=>void
}

type HexagonProps = {
    fill: boolean
    marked?: number
    pos: Pos
    hover: HoverProps
    click: {onClick?: ()=>void}
}

function Hexagon(props: HexagonProps){
    const {pos} = props
    const point = pos.canvas
    const {radius} = defines.map
    const {color} = defines.styles
    const {x, y} = point
    const text = <Text text={`${pos.col}:${pos.row}`} fontSize={12}
        fill={'#0f0'} x={x-radius/2} y={y-radius/4} {...props.hover} />
    const mark = <Text text={`${props.marked}`} fontSize={32}
        fill={'#0f0'} x={x-radius/3} y={y-radius/2} {...props.hover}
        {...props.click} />
    const fill = props.marked ? color.hex_mark :
        props.fill ? color.hex_fill : undefined
    return <Group>
      <RegularPolygon sides={6} radius={radius} x={x} y={y} {...props.hover}
      stroke={color.hex_border} fill={fill}
      strokeWidth={1} {...props.click} />
      {props.fill && text}
      {!!props.marked && mark}
    </Group>
}

function HexItem(props: HexagonProps & {entity: Item | PlanetShip}){
    const {entity, pos} = props
    const [image] = useImage(urls.Images.get(entity))
    const point = pos.canvas
    point.x -= image?.width/2 || 0
    point.y -= image?.height/2 || 0
    return <KImage image={image} {...point} {...props.hover}
        {...props.click} />
}

type HexProps = {
    col: number
    row: number
    marked: string[]
} & HexLayerProps

function Hex(props: HexProps){
    const {col, row, planet} = props
    const [fill, setFill] = React.useState(false)
    const fillProps = {hover: {onMouseLeave: ()=>setFill(false),
        onMouseOver: ()=>setFill(true)}, fill,
        click: {} as any
    }
    if (props.onPointClick)
        fillProps.click = {onClick: ()=>props.onPointClick({col, row})}
    const key = `${col}:${row}`, pos = new Pos(col, row)
    const hexes = []
    hexes.push(<Hexagon key={key} pos={pos} {...fillProps}
        marked={props.marked?.findIndex(k=>k==key)+1} />)
    const item_arr = planet.pos?.items[key]||[]
    for (let k of item_arr)
        hexes.push(<HexItem key={`${k._id}${key}`} entity={k} pos={pos} {...fillProps} />)
    const ship_arr = planet.pos?.ships[key]||[]
    for (let k of ship_arr)
        hexes.push(<HexItem key={`${k._id}${key}`} entity={k} pos={pos} {...fillProps} />)
    return <>{hexes}</>
}

type HexLayerProps = {
    planet: PlanetInfo
    markedPoints?: EPos[]
    onPointClick?: (pos: EPos)=>void
}

export function HexLayer(props: HexLayerProps){
    const hexes = []
    const {size, radius} = defines.map
    const countw = Math.floor(size.width/radius/Math.sqrt(3))
    const counth = Math.floor(size.height/radius*2/3)
    const marked = props.markedPoints?.map(p=>`${p.col}:${p.row}`)
    for (let col=0; col<countw; col++){
        for (let row=0; row<counth; row++){
            hexes.push(<Hex {...props} col={col} row={row}
                marked={marked} />)
        }
    }
    return <Layer>{hexes}</Layer>
}
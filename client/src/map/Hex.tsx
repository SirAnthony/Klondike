import React from 'react';
import {Layer, RegularPolygon, Text, Group, Image as KImage} from 'react-konva'
import {Pos} from './util'
import defines from '../common/defines'
import {Item, PlanetInfo, Ship, Location, PlanetShip} from '../common/entity';
import useImage from 'use-image';
import * as urls from '../common/urls'

type HoverProps = {
    onMouseLeave: ()=>void,
    onMouseOver: ()=>void
}

type HexProps = {
    fill: boolean
    pos: Pos
    hover: HoverProps
}

function Hexagon(props: HexProps){
    const {pos} = props
    const point = pos.canvas
    const {radius} = defines.map
    const {color} = defines.styles
    const {x, y} = point
    const text = <Text text={`${pos.col}:${pos.row}`} fontSize={12}
        fill={'#0f0'} x={x-radius/2} y={y-radius/4} {...props.hover} />
    return <Group>
      <RegularPolygon sides={6} radius={radius} x={x} y={y} {...props.hover}
      stroke={color.hex_border} fill={props.fill ? color.hex_fill : undefined}
      strokeWidth={1} />
      {props.fill && text}
    </Group>
}

function HexItem(props: HexProps & {entity: Item}){
    const {entity, pos} = props
    const [image] = useImage(urls.Images.item(entity))
    const point = pos.canvas
    point.x -= image?.width/2 || 0
    point.y -= image?.height/2 || 0
    return <KImage image={image} {...point} {...props.hover} />
}

function HexShip(props: HexProps & {entity: PlanetShip}){
    const {entity, pos} = props
    const [image] = useImage(urls.Images.ship(entity))
    const point = pos.canvas
    point.x -= image?.width/2 || 0
    point.y -= image?.height/2 || 0
    return <KImage image={image} {...point} {...props.hover} />
}

function reduce_by_location(p, c: {location: Location}){
    const {pos} = c.location, key = `${pos.col}:${pos.row}`;
    (p[key] = p[key]||[]).push(c)
    return p
}

function Hex(props: {col: number, row: number,
    items: {[k: string]: Item[]}, ships: {[k: string]: PlanetShip[]}}){
    const {col, row, items, ships} = props
    const [fill, setFill] = React.useState(false)
    const fillProps = {hover: {onMouseLeave: ()=>setFill(false),
        onMouseOver: ()=>setFill(true)}, fill}
    const key = `${col}:${row}`, pos = new Pos(col, row)
    const hexes = []
    hexes.push(<Hexagon key={`${col}:${row}`} pos={pos} {...fillProps} />)
    const item_arr = items[key]||[]
    for (let k of item_arr)
        hexes.push(<HexItem key={`${k._id}${key}`} entity={k} pos={pos} {...fillProps} />)
    const ship_arr = ships[key]||[]
    for (let k of ship_arr)
        hexes.push(<HexShip key={`${k._id}${key}`} entity={k} pos={pos} {...fillProps} />)
    return <>{hexes}</>
}

export function HexLayer(props: {planet: PlanetInfo}){
    const hexes = []
    const {size, radius} = defines.map
    const countw = Math.floor(size.width/radius/Math.sqrt(3))
    const counth = Math.floor(size.height/radius*2/3)
    const items_by_pos = props.planet.items?.reduce(reduce_by_location, {})||{}
    const ships_by_pos = props.planet.ships?.reduce(reduce_by_location, {})||{}
    for (let col=0; col<countw; col++){
        for (let row=0; row<counth; row++)
            hexes.push(<Hex col={col} row={row} items={items_by_pos} ships={ships_by_pos} />)
    }
    return <Layer>{hexes}</Layer>
}
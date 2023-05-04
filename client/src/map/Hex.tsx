import React from 'react';
import {Layer, RegularPolygon, Text, Group, Image as KImage} from 'react-konva'
import {Pos} from '../common/map'
import defines from '../common/defines'
import {Item, PlanetInfo, PlanetShip, Pos as EPos} from '../common/entity';
import useImage from 'use-image';
import * as mutil from '../common/map'
import * as urls from '../common/urls'


type HoverProps = {
    onMouseLeave: ()=>void
    onMouseOver: ()=>void
}

type HexagonProps = {
    planet: PlanetInfo
    posKey: string
    fill: boolean
    marked?: number
    drop?: number
    pos: Pos
    hover: HoverProps
    click: {onClick?: ()=>void}
}

function Hexagon(props: HexagonProps){
    const {pos, posKey, planet} = props
    const point = pos.canvas
    const {radius} = defines.map
    const {color} = defines.styles
    const {x, y} = point
    const text = <Text text={posKey} fontSize={12}
        fill={'#0f0'} x={x-radius/2} y={y-radius/4} {...props.hover} />
    const mark = <Text text={`${props.marked}`} fontSize={32}
        fill={'#0f0'} x={x-radius/3} y={y-radius/2} {...props.hover}
        {...props.click} />
    const drop = planet.drop?.findIndex(k=>k===posKey)+1
    const fog = planet.fog?.findIndex(k=>k===posKey)+1
    const fill = 
        props.marked ? color.hex_mark :
        props.fill ? color.hex_fill :
        drop ? color.hex_drop : fog ? color.hex_fog :
        undefined
    const opacity = props.marked ? 0.8 :
        props.fill || drop ? 0.6 : 0.3
    return <Group>
      <RegularPolygon sides={6} radius={radius} x={x} y={y} {...props.hover}
      stroke={color.hex_border} fill={fill} opacity={opacity}
      strokeWidth={1} {...props.click} />
      {props.fill && text} 
      {!!props.marked && mark}
    </Group>
}

function HexItem(props: HexagonProps & {entity: Item | PlanetShip}){
    const {entity, pos} = props
    const [image] = useImage(urls.Images.get(entity))
    const point = pos.canvas
    const w = Math.min(image?.width|0, 32), h = Math.min(image?.height|0, 32)
    point.x -= w/2 || 0
    point.y -= h/2 || 0
    return <KImage image={image} {...point} {...props.hover}
        width={w} height={h} {...props.click} />
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
    const key = `${col}:${row}`, pos = new Pos(col, row), hexes = []
    const hprops = {planet, pos, posKey: key, ...fillProps}
    hexes.push(<Hexagon key={key} {...hprops} marked={
        props.marked?.findIndex(k=>k===key)+1} />)
    const item_arr = planet.pos?.items[key]||[]
    for (let k of item_arr)
        hexes.push(<HexItem key={`${k._id}${key}`} entity={k} {...hprops} />)
    const ship_arr = planet.pos?.ships[key]||[]
    for (let k of ship_arr)
        hexes.push(<HexItem key={`${k._id}${key}`} entity={k} {...hprops} />)
    return <>{hexes}</>
}

type HexLayerProps = {
    planet: PlanetInfo
    showDropzone?: boolean
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
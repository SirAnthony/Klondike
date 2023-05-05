import React from 'react';
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import {PlanetInfo, PlanetZone, User, Item, Location,
    Pos as EPos, Ship, PlanetShip} from '../common/entity';
import {Layer, Stage, Circle, Image} from 'react-konva'
import {HexLayer} from './Hex';
import {UILayer, UIButtonCallbacks} from './UI'
import {Pos} from '../common/map'
import ShipDetails from '../ship/Details';
import defines from '../common/defines'
import L from './locale'
import useImage from 'use-image';
import * as mutil from '../common/map'
import { ErrorMessage } from 'src/util/errors';

function Celestial(props: {zone: PlanetZone}){
    const {zone} = props
    const pos = new Pos(zone.center)
    const point = pos.canvas
    const {radius} = defines.map
    const {color} = defines.styles
    return <Circle x={point.x} y={point.y} radius={zone.radius*radius*2} 
      stroke={color.planet_border} strokeWidth={1}/>
}

function Planet(props: {planet: PlanetInfo}){
    const {planet} = props
    const zones = planet.zones.map(z=>
        <Celestial key={`zone_${z.center.col}_${z.center.row}`} zone={z} />)
    const bg = `/static/img/map/${planet.type.toString().toLowerCase()}.jpg`
    const [image] = useImage(bg) 
    return <Layer>
      <Image image={image} {...props} />
      {zones}
    </Layer>
}

function CanvasView(props: {planet: PlanetInfo} & UIButtonCallbacks & PlanetProps){
    const {planet} = props
    const {width, height} = defines.map.size
    return <Stage width={width} height={height} className="map">
      <Planet planet={planet} />
      <HexLayer {...props} />
      <UILayer width={width} height={height} {...props} />
    </Stage>
}

function reduce_by_location(p, c: {location: Location}){
    const {pos} = c.location||{}, key = `${pos?.col|0}:${pos?.row|0}`;
    (p[key] = p[key]||[]).push(c)
    return p
}


type PlanetState = {
    planet?: PlanetInfo
    points?: Pos[]
    ui_ship: Boolean
    ui_inventory: Boolean
    ui_journal: Boolean
}
type PlanetProps = {
    user: User
    id: string
    ship?: PlanetShip
    markedPoints?: EPos[]
    onPointClick?: (pos: EPos)=>void
}

export class PlanetView extends F.Fetcher<PlanetProps, PlanetState> {
    constructor(props){
        super(props)
        this.state = {ui_ship: false, ui_inventory: false, ui_journal: false}
    }
    componentDidUpdate(prevProps){
        if (prevProps.id != this.props.id)
            this.fetch()
    }
    get fetchUrl() {
        const {id} = this.props
        return `/api/planet/${id}`
    }
    fetchState(data: any = {}){
        const {item, entity} : {item: PlanetInfo, entity: Ship} = data
        if (!item)
            return {item: null}
        item.items = item.items?.map(item=>{
            const obj = new (Item.class(item.type))()
            for (let k in item)
                obj[k] = item[k]
            return obj
        })
        item.pos = {
            items: item.items?.reduce(reduce_by_location, {})||{},
            ships: item.ships?.reduce(reduce_by_location, {})||{},
        }
        const poses = new Set([...Object.keys(item.pos.items),
            ...((entity?.known||{})[item._id]||[])])
        item.fog = []
        item.drop = []
        for (let zone of item.zones){
            item.fog = mutil.Coordinates.Figures.circle(zone.center, zone.radius)
                .map(c=>`${c.col}:${c.row}`).filter(f=>!poses.has(f))
            if (this.props.ship){
                item.drop = mutil.Coordinates.Figures.circle(zone.center, zone.radius+2,
                    zone.radius).map(c=>`${c.col}:${c.row}`)
            }
        }
        const pship = this.props.ship
        if (pship){
            const {pos} = pship.location
            const arr = item.pos.ships[`${pos.col}:${pos.row}`] =
                item.pos.ships[`${pos.col}:${pos.row}`]||[] as any
            arr.push(pship as PlanetShip)
        }
        const points = item.ships?.reduce((p, s)=>[...p, ...(s.points||[])], [])
        return {item: data, planet: item, entity, points}
    }
    
    menus(){
        const {state} = this
        const {user} = this.props
        const close_ship = ()=>this.setState({ui_ship: false})
        const menus = []
        if (state.ui_ship)
            menus.push(<ShipDetails user={user} onClose={close_ship} />)
        if (!menus.length)
            return
        return <RB.Container className="menu-absolute">
          {menus}
        </RB.Container>
    }
    render() {
        const {planet} = this.state
        if (!planet)
            return <ErrorMessage message={L('not_found')} />
        const points = this.props.markedPoints || this.state.points
        return <RB.Container className="map-container">
          <CanvasView planet={planet} {...this.props} markedPoints={points} />
          {this.menus()}
        </RB.Container>
    }
}
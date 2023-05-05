import React from 'react';
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import {PlanetInfo, PlanetZone, User, Item, Location,
    Pos as EPos, Ship, PlanetShip} from '../common/entity';
import {Layer, Stage, Circle, Image} from 'react-konva'
import {HexLayer} from './Hex';
import {UILayer, UIButtonCallbacks} from './UI'
import {Pos} from '../common/map'
import defines from '../common/defines'
import L from './locale'
import useImage from 'use-image';
import * as mutil from '../common/map'
import { ErrorMessage } from 'src/util/errors';
import { ItemPopover } from 'src/inventory/Item/Popover';

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
        <Celestial key={`zone_${Pos.getKey(z.center)}`} zone={z} />)
    const bg = `/static/img/map/${planet.type.toString().toLowerCase()}.jpg`
    const [image] = useImage(bg) 
    return <Layer>
      <Image image={image} {...props} />
      {zones}
    </Layer>
}

type PlanetCanvasProps = {
    planet: PlanetInfo
} & PlanetProps & UIButtonCallbacks

function CanvasView(props: PlanetCanvasProps){
    const {planet} = props
    const {width, height} = defines.map.size
    return <Stage width={width} height={height} className="map">
      <Planet planet={planet} />
      <HexLayer {...props} />
      <UILayer width={width} height={height} {...props} />
    </Stage>
}

function reduce_by_location(p, c: {location: Location}){
    const {pos} = c.location||{}, key = Pos.getKey(pos);
    (p[key] = p[key]||[]).push(c)
    return p
}


type PlanetState = {
    planet?: PlanetInfo
    points?: Pos[]
    popups?: {[id: string]: React.ReactElement}
}
type PlanetProps = {
    user: User
    id: string
    ship?: PlanetShip
    markedPoints?: EPos[]
    onHexClick?: (pos: EPos)=>void
}

export class PlanetView extends F.Fetcher<PlanetProps, PlanetState> {
    constructor(props){
        super(props)
        this.state = {}
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
    popup(item: Item){
        const point = mutil.Map.toPoint(item.location.pos)
        const {width, height} = defines.map.size
        let left = point.x, top = point.y
        const lright = left-340, lleft = left+10
        left = left>width-400 ? lright : left < 400 ? lleft :  
            left > width/2 ? lleft + 100 : lright, 100
        top = Math.max(Math.min(top - 100, height - 450), 40)
        return <RB.Container className='popover-map' style={{left, top}}>
          <ItemPopover item={item} onClose={()=>this.onPopupClose(item)} />
        </RB.Container>
    }
    onPopupClose(item: Item){
        const {popups = {}} = this.state
        delete popups[item._id]
        this.setState({popups: {...popups}})
    }
    onHexClick(pos: EPos){
        if (this.props.onHexClick)
            return this.props.onHexClick(pos)
        const {planet} : {planet?: PlanetInfo} = this.state
        const items = planet?.pos?.items[Pos.getKey(pos)]
        if (!items?.length)
            return
        const {popups = {}} = this.state
        for (let item of items)
            popups[item._id] = this.popup(item)
        this.setState({popups: {...popups}})
    }
    render() {
        const {planet, popups = {}} = this.state
        if (!planet)
            return <ErrorMessage message={L('not_found')} />
        const points = this.props.markedPoints || this.state.points
        return <RB.Container className="map-container">
          {Object.values(popups)}
          <CanvasView planet={planet} {...this.props} markedPoints={points}
            onHexClick={pos=>this.onHexClick(pos)} />
        </RB.Container>
    }
}
import React from 'react';
import * as RB from 'react-bootstrap'
import * as RR from 'react-router-dom'
import * as F from '../Fetcher'
import {Planet as CPlanet, PlanetZone, User} from '../common/entity';
import {Layer, Stage, Circle, Image} from 'react-konva'
import {HexLayer} from './Hex';
import {UILayer, UIButtonCallbacks} from './UI'
import {Pos} from './util'
import ShipDetails from '../ship/Details';
import defines from '../common/defines'
import L from './locale'
import useImage from 'use-image';

function Celestial(props: {zone: PlanetZone}){
    const {zone} = props
    const pos = new Pos(zone.center)
    const point = pos.canvas
    const {radius} = defines.map
    const {color} = defines.styles
    return <Circle x={point.x} y={point.y} radius={zone.radius*radius*2} 
      stroke={color.planet_border} strokeWidth={1}/>
}

function Planet(props: {planet: CPlanet}){
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

function CanvasView(props: {planet: CPlanet, date: Date} & UIButtonCallbacks){
    const {planet} = props
    const {width, height} = defines.map.size
    return <Stage width={width} height={height} className="map">
      <Planet planet={planet} />
      <HexLayer />
      <UILayer width={width} height={height} {...props} />
    </Stage>
}

type PlanetState = {
    id: string
    planet?: CPlanet
    date?: Date
    ui_ship: Boolean
    ui_inventory: Boolean
    ui_journal: Boolean
}
type PlanetProps = {
    user: User
    params: RR.Params
}

export class PlanetView extends F.Fetcher<PlanetProps, PlanetState> {
    constructor(props){
        super(props)
        this.state = {id: props.params.id,
            ui_ship: false, ui_inventory: false, ui_journal: false}
    }
    get fetchUrl() {
        const {id} = this.state
        return `/api/planet/${id}`
    }
    fetchState(data: any){
        const {planet, ship, date} = data
        return {item: data, planet, ship, date: new Date(date)}
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
        const {planet, date} = this.state
        if (!planet)
            return <div>{L('not_found')}</div>
        return <RB.Container className="map-container">
          <CanvasView planet={planet} date={date} 
            onShipClick={()=>this.setState({ui_ship: true})}
            onJournalClick={()=>this.setState({ui_journal: true})}
            onInventoryClick={()=>this.setState({ui_inventory: true})} />
          {this.menus()}
        </RB.Container>
    }
}
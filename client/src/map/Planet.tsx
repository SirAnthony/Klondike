import React from 'react';
import * as RR from 'react-router-dom'
import * as F from '../Fetcher'
import {Planet as CPlanet, PlanetZone, User} from '../common/entity';
import {Layer, Stage, Circle, Image} from 'react-konva'
import {HexLayer} from './Hex';
import {UILayer} from './UI'
import {Pos} from './util'
import defines from '../common/defines'
import L from './locale'
import useImage from 'use-image';

function Celestial(props: {zone: PlanetZone}){
    const {zone} = props
    const pos = new Pos(zone.center)
    const point = pos.canvas
    const {radius, colors} = defines.map
    return <Circle x={point.x} y={point.y} radius={zone.radius*radius*2} 
      stroke={colors.planet_border} strokeWidth={1}/>
}

function Planet(props: {planet: CPlanet, width: number, height: number}){
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

type PlanetState = {
    id: string
    planet?: CPlanet
}
type PlanetProps = {
    user: User
    params: RR.Params
}

export class PlanetView extends F.Fetcher<PlanetProps, PlanetState> {
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
        const date = new Date()
        const {width, height} = defines.map.size
        return <Stage width={width} height={height} className="map">
          <Planet planet={planet} width={width} height={height} />
          <HexLayer />
          <UILayer width={width} height={height} date={date} />
        </Stage>
    }
}
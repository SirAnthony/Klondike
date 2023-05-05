import React from 'react';
import {Planet as CPlanet, PlanetZone, Pos, User} from '../common/entity';
import {Layer, Rect, Text, Group} from 'react-konva'
import {Button} from './Components'
import defines from '../common/defines'
import L from './locale'

export type UIButtonCallbacks = {
    onHexClick?: (pos: Pos)=>void
}

function ActionUI(props: UIProps){
    return null
}

type UIProps = {
    width: number
    height: number
} & UIButtonCallbacks

export class UILayer extends React.Component<UIProps> {
    constructor(props){
        super(props)
    }
    render(){
        return <Layer>
          <ActionUI {...this.props} />
        </Layer>
    }
}
import React from 'react';
import {Planet as CPlanet, PlanetZone, User} from '../common/entity';
import {Layer, Rect, Text, Group} from 'react-konva'
import {Button} from './Components'
import defines from '../common/defines'
import L from './locale'

export type UIButtonCallbacks = {
    onShipClick?: ()=>void
    onInventoryClick?: ()=>void
    onJournalClick?: ()=>void
}
/*
function DateUI(props: UIProps){
    const {width, date} = props
    const rwidth = 135, rheight = 40
    const x = width/4 - rwidth
    const {color} = defines.styles
    const dt = date.toLocaleDateString(defines.locale)
    const tt = date.toLocaleTimeString(defines.locale, {timeStyle: 'short'})
    return <Group>
      <Rect x={x} y={0} width={rwidth} height={rheight}
        fill={color.ui_box} stroke={color.ui_border} strokeWidth={1} />
      <Text text={dt} fill={color.ui_border} align={'center'} fontSize={10}
        fontStyle={'normal'} x={x+50} y={5} />
      <Text text={tt} fill={color.ui_text} align={'center'} fontSize={14}
        x={x+55} y={20} />
    </Group>
}
*/

function ActionUI(props: UIProps){
    const [hidden, setHidden] = React.useState(false)
    const {width, height} = props
    const rwidth = 800, rheight = 100
    const x = width/2 - rwidth/2, y = height-rheight
    const {color} = defines.styles
    return <Group>
      <Button x={x+rwidth-20} y={(hidden ? height : y)-20} width={20} height={20}
        onClick={()=>setHidden(!hidden)} text={hidden ? '⇑' : '⇓'}
        fontStyle='bold' />
      {!hidden && <Rect x={x} y={y} width={rwidth} height={rheight}
        fill={color.ui_box} stroke={color.ui_border} strokeWidth={2} />}
      {!hidden && <Button x={x+15} y={y+10} width={100} height={23}
        text='ui_journal' onClick={props.onJournalClick} />}
      {!hidden && <Button x={x+15} y={y+70} width={100} height={23}
        text='ui_sos' />}
      {!hidden && <Button x={x+rwidth/2-100} y={y+rheight/2-20} width={200}
        height={40} text='ui_flight' />}
      {!hidden && <Button x={x+rwidth-115} y={y+10} width={100} height={23}
        text='ui_inventory' onClick={props.onInventoryClick} />}
      {!hidden && <Button x={x+rwidth-115} y={y+40} width={100} height={23}
        text='ui_ship' onClick={props.onShipClick} />}
      {!hidden && <Button x={x+rwidth-115} y={y+70} width={100} height={23}
        text='ui_network' />}
    </Group>
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
import React from 'react';
import {Rect, Text, Group} from 'react-konva'
import defines from '../common/defines'
import {textWidth} from '../common/map'
import {LR} from './locale'
import * as _ from 'lodash'
import Konva from 'konva';

export function Button(props: Konva.RectConfig & Konva.TextConfig){
    const {x, y, width, height, text} = props
    const {fontSize = 14} = props
    const [hover, setHover] = React.useState(false)
    const {color} = defines.styles
    const styles = _.pick(props, 'fontSize', 'fontStyle', 'fontFamily')
    const str = text ? LR(text) : null
    const twidth = text ? textWidth(str, styles) : 0
    const ctr = _.pick(props, 'onClick', 'onMouseOver', 'onMouseOut')
    const controls = {...ctr,
        onMouseOver: ev=>{ ctr.onMouseOver && ctr.onMouseOver(ev); setHover(true) },
        onMouseOut: ev=>{ ctr.onMouseOut && ctr.onMouseOut(ev); setHover(false) }
    }
    return <Group>
      <Rect {...controls} x={x} y={y} width={width} height={height}
        stroke={color.ui_border} cornerRadius={5}
        fill={hover ? color.ui_box_hover : color.ui_box} />
      {text && <Text {...controls} {...styles} text={str}
        x={x+width/2-twidth/2} y={y+height/2-fontSize/4}
        fill={color.ui_text} align={'center'} />}
    </Group>
}
import defines from '../common/defines'
import {Pos as CPos} from '../common/entity';

export type Point = {
    x: number
    y: number
}

function isPos(obj: unknown): obj is CPos {
    return obj && typeof obj==='object' &&
        typeof obj['col']==='number' &&
        typeof obj['row']==='number'
}

export class Pos implements CPos {
    col: number
    row: number
    constructor(c: number | CPos, r?: number){
        if (isPos(c)){
            this.col = c.col
            this.row = c.row
        } else if (typeof r!=='number') {
            throw new Error('wrong type for second argument')
        } else {
            this.col = c
            this.row = r
        }
    }
    get canvas(): Point {
        const {radius} = defines.map
        const x = radius * (1 + Math.sqrt(3) * (this.col + 0.5*(this.row&1)))
        const y = radius * (1 + 3/2 * this.row)
        return {x, y}
    }
}
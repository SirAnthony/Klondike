import defines from './defines'
import {Pos as CPos} from './entity';

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
        const x = radius * (1 + Math.sqrt(3) * (this.col + 0.5*(this.row&1)))-1
        const y = radius * (1 + 3/2 * this.row)
        return {x, y}
    }
    static getKey(pos: CPos){ return `${pos?.col|0}:${pos?.row|0}` }
}

export namespace Map {
    export function tileDimensions(){
        const {radius, size} = defines.map
        const width = Math.floor(size.width / radius / Math.sqrt(3))-1
        const height =  Math.floor(size.height / radius * 2/3)-1
        return {width, height}
    }
    export function toPoint(pos: CPos){
        const {radius} = defines.map
        const x = radius * Math.sqrt(3) * (pos.col + 0.5 * (pos.row&1))
        const y = radius * 3/2 * pos.row
        return {x, y}
    }
}

export namespace Coordinates {
    type cHex = {q: number, r: number}
    type cPos = {col: number, row: number}
    type cCube = {q: number, r: number, s: number}

    function axial_to_oddr(hex: cHex) : cPos {
        const col = hex.q + (hex.r - (hex.r&1)) / 2
        const row = hex.r
        return {col, row}
    }
    
    function oddr_to_axial(hex: cPos) : cHex {
        const q = hex.col - (hex.row - (hex.row&1)) / 2
        const r = hex.row
        return {q, r}
    }

    function cube_to_axial(cube: cCube) : cHex {
        const q = cube.q
        const r = cube.r
        return {q, r}
    }

    function axial_to_cube(hex: cHex) : cCube {
        const q = hex.q
        const r = hex.r
        const s = -q-r
        return {q, r, s}
    }

    function axial_add(hex: cHex, vec: cHex) : cHex {
        return {q: hex.q + vec.q, r: hex.r + vec.r} }

    const oddr_direction_differences = [
        // even rows 
        [[+1,  0], [ 0, -1], [-1, -1], 
         [-1,  0], [-1, +1], [ 0, +1]],
        // odd rows 
        [[+1,  0], [+1, -1], [ 0, -1], 
         [-1,  0], [ 0, +1], [+1, +1]],
    ]
    function oddr_offset_neighbor(hex: cPos, direction : number) {
        const parity = hex.row & 1
        const diff = oddr_direction_differences[parity][direction]
        return {col: hex.col + diff[0], row: hex.row + diff[1]}
    }

    export namespace Round {
        export function cube(frac: cCube) : cCube {
            let q = Math.round(frac.q)
            let r = Math.round(frac.r)
            let s = Math.round(frac.s)
            const q_diff = Math.abs(q - frac.q)
            const r_diff = Math.abs(r - frac.r)
            const s_diff = Math.abs(s - frac.s)
    
            if (q_diff > r_diff && q_diff > s_diff)
                q = -r-s
            else if (r_diff > s_diff)
                r = -q-s
            else
                s = -q-r
            return {q, r, s}
        }
        export function axial(hex: cHex) : cHex {
            return cube_to_axial(cube(axial_to_cube(hex))) }
    }

    export namespace Distance {
        export function cube(a: cCube, b: cCube){
            const vec = {q: a.q - b.q, r: a.r - b.r, s: a.s - b.s}
            return (Math.abs(vec.q) + Math.abs(vec.r) + Math.abs(vec.s)) / 2
            // or: (abs(a.q - b.q) + abs(a.r - b.r) + abs(a.s - b.s)) / 2
        }

        export function axial(a: cHex, b: cHex){
            return (Math.abs(a.q - b.q) +
                Math.abs(a.q + a.r - b.q - b.r) +
                Math.abs(a.r - b.r)) / 2
        }

        export function offset(a: cPos, b: cPos){
            const ac = oddr_to_axial(a)
            const bc = oddr_to_axial(b)
            return axial(ac, bc)
        }
    }

    export namespace Line {
        function lerp(a: number, b: number, t: number) {
            return a + (b - a) * t }

        function cube_lerp(a: cCube, b: cCube, t: number): cCube {
            return {q: lerp(a.q, b.q, t), r: lerp(a.r, b.r, t), s: lerp(a.s, b.s, t)} }

        export function cube(a: cCube, b: cCube){
            const N = Distance.cube(a, b)
            const results = []
            for (let i=0; i<N; ++i)
                results.push(Round.cube(cube_lerp(a, b, 1.0 / N * i)))
            return results
        }

        export function offset(a: cPos, b: cPos){
            const ca = axial_to_cube(oddr_to_axial(a))
            const cb = axial_to_cube(oddr_to_axial(b))
            return cube(ca, cb).map(p=>axial_to_oddr(cube_to_axial(p)))
        }
    }

    export namespace Range {
        export function axial(center: cHex, distance: number) : cHex[] {
            const results = [], N = distance
            for (let q=-N; q<=N; ++q){
                for (let r=Math.max(-N, 0-q-N); r<= Math.min(N, N-q); ++r)
                    results.push(axial_add(center, {q, r}))   
            }
            return results
        }

        export function offset(center: cPos, distance: number) : cPos[]{
            return axial(oddr_to_axial(center), distance).map(c=>axial_to_oddr(c)) }

        function intersect(a: cHex, aDist: number, b: cHex, bDist: number){
            const results = []
            const qmin = Math.max(a.q-aDist, b.q-bDist)
            const qmax = Math.min(a.q+aDist, b.q+bDist)
            const rmin = Math.max(a.r-aDist, b.r-bDist)
            const rmax = Math.min(a.r+aDist, b.r+bDist)
            //for each qmin ≤ q ≤ qmax:
            //    for each max(rmin, -q-smax) ≤ r ≤ min(rmax, -q-smin):
            //        results.append(Hex(q, r))
            for (let q=qmin; q<=qmax; ++q){
                for (let r=rmin; r<=rmax; ++r)
                    results.push({q, r})
            }
            return results            
        }

        function diff(a: cHex, aDist: number, b: cHex, bDist: number){
            const results = []
            const qmin = Math.max(a.q-aDist, b.q-bDist)
            const qmax = Math.min(a.q+aDist, b.q+bDist)
            const rmin = Math.max(a.r-aDist, b.r-bDist)
            const rmax = Math.min(a.r+aDist, b.r+bDist)
            for (let q=qmin; q<=qmax; ++q){
                for (let r=rmin; r<rmax; ++r){
                    // if (a.q-q < b.q-q && )

                }
            }
        }
    }

    export namespace Figures {
        export function circle(center: cPos, distance: number, empty?: number){
            const ax = oddr_to_axial(center)
            const range = Range.axial(ax, distance)
            let result = []
            if (empty){
                // Gosh, not effective but simplier
                let erange = Range.axial(ax, empty).map(c=>`${c.q}:${c.r}`)
                result = range.filter(k=>!erange.includes(`${k.q}:${k.r}`))
            } else
                result = [...range]
            return result.map(r=>axial_to_oddr(r))
        }
    }
}
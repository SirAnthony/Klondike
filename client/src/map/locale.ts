import {load, default as BL} from '../common/locale'

load('map', {
})

export default function L(str: string, ...args): string {
    return BL(`map_${str}`, ...args)
}
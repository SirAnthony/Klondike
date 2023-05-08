import * as secrets from '../secrets.json'
import * as entity from './entity'

export default Object.assign({
    server: {
        host: 'localhost',
        port: '2523',
        domain: 'klondike.in',
    },
    locale: 'ru-RU',
}, secrets)

export type Config = {
    endgame: boolean
    time: {market: number, ship: {speed: number, research: number}},
    points: {
        patent: {
            [k in entity.PatentOwnership | 'pay' | 'close']: {
                [w in entity.PatentWeight]: number
            } | number
        },
        order: {
            [k in entity.ResourceSpecialityType | 'open' | 'halfclosed']: number
        }
    },
    price: {
        res: {[k in entity.ResourceType]: number}[]
    }
}
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
    points: {
        patent_close: number
        patent_pay: number
        patent: {
            [k in entity.PatentOwnership | string]: number
        },
        order: {
            [k in entity.ResourceSpecialityType | string] : number
        }
    },
    price: {
        res: {
            [cycle: number]: {[k in entity.ResourceType]: number}
        }
    }
}
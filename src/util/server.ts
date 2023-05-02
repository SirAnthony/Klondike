import {server} from '../server'
import defines from '../../client/src/common/defines'
import {ObjectId} from 'mongodb'

export function currentDate(){
    const date = server.start_ts || new Date()
    const diff = +(new Date())-(+date)
    return new Date(+defines.date + diff)
}

export function asID(a: string | ObjectId): string { return ''+a }
export function IDMatch(a, b){
    return asID(a)===asID(b)
}

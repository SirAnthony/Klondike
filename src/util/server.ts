import {server} from '../server'
import defines from '../../client/src/common/defines'
import {ObjectId} from 'mongodb'

export function currentDate(){
    const date = server.start_ts || new Date()
    const diff = +(new Date())-(+date)
    return new Date(+defines.date + diff)
}

export function asID(id: string | ObjectId): string { return ''+id }
export function isID(id: string){ return /^[a-f0-9]{12,24}$/.test(id) }
export function IDMatch(a, b){
    return asID(a)===asID(b)
}
import {server} from '../server'
import defines from '../../client/src/common/defines'

export function currentDate(){
    const date = server.start_ts || new Date()
    const diff = +(new Date())-(+date)
    return new Date(+defines.date + diff)
}
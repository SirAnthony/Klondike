import { UserType, UserTypeIn } from "../../client/src/common/entity";
import {UserController} from '../entity'
import {asID} from './server'
import { ApiError, Codes } from "../../client/src/common/errors";

const id_matches = {}
async function user_by_match(match: string){
    if (match in id_matches)
        return id_matches[match]
    const parts = match.split(' ')
    const filter = parts.length>1 ? {$or: [
        {first_name: parts[0], last_name: parts[1]},
        {alias: match}     
    ]} : {alias: match}
    const user = await UserController.find(filter)
    return id_matches[match] = user?._id ? asID(user._id) : match
}

export async function process_data(data = ''){
    const re = /\{([^}]+)\}/g
    const match = data.match(re)||[]
    const matches = {}
    for (let m of match){
        const input = m.replace(/^{/, '').replace(/}$/, '') 
        if (!(input in matches))
            matches[input] = await user_by_match(input)
    }
    for (let m in matches)
        data = data.replace(new RegExp(`{${m}}`, 'g'), `{${m}:${matches[m]}}`)
    return data
}

export function CheckRole(roles: UserType){
    return (target: Object, key: string, descriptor: TypedPropertyDescriptor<any>)=>{
        return {...descriptor, value: async function check(user: UserController, ...args: any[]){
            const types = (roles | UserType.Master)
            if (types && !UserTypeIn(user, types))
                throw new ApiError(Codes.INCORRECT_LOGIN, 'Access denied')
            return descriptor.value.apply(this, arguments)
        }}
    }
}


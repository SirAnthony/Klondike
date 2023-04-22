import {UserController} from '../entity'

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
    return id_matches[match] = user?._id || match
}

export async function process_data(data = ''){
    const match = data.match(/\{[^}]\}/g)||[]
    const matches = {}
    for (let m of match){
        if (!(m in matches))
            matches[m] = await user_by_match(m)
    }
    for (let m in matches)
        data = data.replace(/\{[^}]\}/g, `{${m}:${matches[m]}}`)
    return data
}
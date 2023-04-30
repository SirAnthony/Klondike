import {Item, ItemType, InstitutionType} from '../../common/entity'
import {Resource, ResourceType} from '../../common/entity'

export const owners_exclude = (type: ItemType)=>{
    switch(type){
        case ItemType.Resource: return [InstitutionType.User]
        case ItemType.Coordinates: return [InstitutionType.User]
        case ItemType.Module: return [InstitutionType.User]
        case ItemType.Patent: return [InstitutionType.User, InstitutionType.Ship,
            InstitutionType.Research, InstitutionType.Organization]
        case ItemType.Artifact: return [InstitutionType.User]
    }
    return []
}

const long_fields = ['owner', 'location', 'data']
export const column_layout = (long: Boolean)=>{
    const MAX_SUM = 12
    const fields = long ? long_fields : []
    const res: any = Object.assign({id: 1, name: 1, type: 1, value: 1, kind: 1,
        price: 1, actions: 1}, fields.reduce((p, c)=>{ p[c]=1; return p }, {}))
    let prio = 'actions data location owner id name type kind'.split(' ')
        .filter(f=>long ? true : !long_fields.includes(f))
    let free = MAX_SUM - Object.keys(res).reduce((p, v)=>p+res[v], 0)
    for (let i = free, j = 0; i>0; --i, ++j)
        res[prio[j%prio.length]] += 1
    return res
}

export const item_base_price = (item: Item, prices: {[k in ResourceType]: number} = {} as any)=>{
    return item.type == ItemType.Resource ? 
        (prices[(item as Resource).kind]|0) * (item as Resource).value : item.price
}
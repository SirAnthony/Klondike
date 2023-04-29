import {Item, ItemType, ItemTypePrefix} from '../common/entity'
import {PlanetShip, Resource, ResourceType} from '../common/entity'
import {Ship, User} from '../common/entity'
import L from '../common/locale'

export function IDField(props: {item: Item}){
    const {item} = props
    const {_id, type} = item
    const str = [ItemTypePrefix[type], _id.slice(0, 6)].join('-')
    return <span className='field-id wrap-anywhere'>{str}</span>
}

export function Delimeter(){
    return <hr className='delimeter' />
}

export function ResourceImg(props: {res: Resource}){
    const {res} = props
    return <img src={Images.item(res)} alt={L(`res_kind_${res.kind}`)} />
}

export const Images = {
    item: (item: Item)=>{
        const name = item.type === ItemType.Resource ?
            ResourceType[(item as Resource).kind].toLowerCase() : 'none'
        return `/static/img/res/${name}.png`
    },
    ship: (ship: Ship | PlanetShip)=>
        `/static/img/ships/${ship.img}.png`,
    user: (user: User)=>
        `/static/img/users/${user.img||'user'}.png`
}
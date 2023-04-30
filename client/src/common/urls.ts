import {Institution, InstitutionType, Item, ItemType} from '../common/entity'
import {PlanetShip, Resource, ResourceType} from '../common/entity'
import {Ship, User} from '../common/entity'

export const Images = {
    prefix: '/static/img',
    item: (item: Item)=>{
        const name = item.type === ItemType.Resource ?
            ResourceType[(item as Resource).kind].toLowerCase() : 'none'
        return `/res/${name}.png`
    },
    entity: (entity: Institution)=>
        (Images[InstitutionType[entity.type]?.toLowerCase()] || Images.corp)(entity),
    user: (user: User)=>
        `/users/${user.img||'user'}.png`,
    corp: (entity: Institution)=>
        `/corps/${entity.img||'corp'}.png`,
    ship: (ship: Ship | PlanetShip)=>
        `/ships/${ship.img}.png`,
    get: (src?: Institution | Item)=>!src ? '' :
        Images.prefix+(src instanceof Item ? Images.item(src) : Images.entity(src)),
}
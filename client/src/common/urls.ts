import {Institution, InstitutionType, Item, ItemType} from '../common/entity'
import {PlanetShip, Resource, ResourceType} from '../common/entity'
import {Ship, User} from '../common/entity'

export const Images = {
    prefix: '/static/img',
    item: (item: Item)=>{
        const name = item.type === ItemType.Resource ?
            ResourceType[(item as Resource).kind].toLowerCase() :
            item.type == ItemType.Artifact ? 'artifact' :
            item.type == ItemType.Coordinates ? 'point' : 'none'
        return `/res/${name}.png`
    },
    entity: (entity: Institution | PlanetShip)=>
        (Images[InstitutionType[entity.type]?.toLowerCase()] || Images.corp)(entity),
    user: (user: User)=>
        `/users/${user.img||'user'}.png`,
    corp: (entity: Institution)=>
        `/corps/${entity.img||'corp'}.png`,
    ship: (ship: Ship | PlanetShip)=>
        `/ships/${ship.img}.png`,
    get: (src?: Institution | PlanetShip | Item)=>!src ? '' :
        Images.prefix+(src instanceof Item ? Images.item(src) : Images.entity(src)),
}
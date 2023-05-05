import {Institution, InstitutionType, Item, ItemType, Owner} from '../common/entity'
import {PlanetShip, Resource, ResourceType} from '../common/entity'
import {Ship, User} from '../common/entity'

export const Links = {
    ship: (entity: Owner)=>`/ship/${entity._id}`,
    profile: (entity: Owner)=>`/profile/${entity.type}/${entity._id}`,
    inventory: (entity: Owner)=>`/inventory/${entity.type}/${entity._id}`
}

type InstObj = Omit<Institution, 'keys' | 'class'> 

export const Images = {
    prefix: '/static/img',
    item: (item: Item)=>{
        const name = item.type === ItemType.Resource ?
            ResourceType[(item as Resource).kind].toLowerCase() :
            item.type == ItemType.Artifact ? 'artifact' :
            item.type == ItemType.Coordinates ? 'point' : 'none'
        return `/res/${name}.png`
    },
    entity: (entity: InstObj | PlanetShip)=>
        (Images[InstitutionType[entity.type]?.toLowerCase()] || Images.corp)(entity),
    user: (user: User)=>
        `/users/${user.img||'user'}.png`,
    corp: (entity: InstObj)=>
        `/corps/${entity.img||'corp'}.png`,
    ship: (ship: Ship | PlanetShip)=>
        `/ships/${ship.img}.png`,
    get: (src?: InstObj | PlanetShip | Item)=>!src ? '' :
        Images.prefix+(src instanceof Item ? Images.item(src) : Images.entity(src)),
}
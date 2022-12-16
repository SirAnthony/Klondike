
export interface Identifier {
    _id?: string
}

export const Profile = {
    fields: `email first_name last_name alias
        phone`.replace(/\s+/g, ' ').split(' '),
    static: ['email'],
}

export enum UserType {None, Corporant, Captain, Mechanic, Navigator, Scientist, Guard, Master}
export class UserID implements Identifier {
    _id?: string
    alias: string
}
export class User extends UserID {
    first_name: string
    last_name: string
    email: string
    phone: string
    credit: number
    type: UserType
    get admin(){ return this.type == UserType.Master }
    get displayName(){
        return this.alias || [this.first_name,
            this.last_name].filter(Boolean).join(' ')
    }
    get fullName(){
        return [this.first_name, this.alias ? `(${this.alias})` : '',
            this.last_name].filter(Boolean).join(' ')
    }
}

export enum ResourceType {Mineral, Energy, Alloy, Crystal, Gas}
export class Resource {
    type: ResourceType
}

export class Corporation extends UserID {
    name: string
}

export enum ItemType {Artifact, Drone}
export class Item extends UserID {
    name: string
    type: ItemType
    size: number
}

export class Drone extends Item {
    movement: number
}

export class Ship extends UserID {
    name: string
    speed: number
    movement: number
    integrity: number
    size: number
    inventory: Item[]
}
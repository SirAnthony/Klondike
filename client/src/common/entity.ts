
export interface Pos {
    col: number
    row: number
}

export interface Identifier {
    _id?: string
    name: string
}
export class ID implements Identifier {
    _id?: string
    name: string
}

export const Profile = {
    fields: `email first_name last_name alias
        phone`.replace(/\s+/g, ' ').split(' '),
    static: ['email'],
}

export enum UserType {None, Corporant, Captain, Mechanic, Navigator, Scientist, Guard, Master}
export class User extends ID {
    alias: string
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
export class Corporation extends ID {
}

export enum ItemType {Artifact, Drone, Module}
export class Item extends ID {
    type: ItemType
    mass: number
}

export class Drone extends Item {
    movement: number
}

export class Module extends Item {
    energy: number
    boosts: [{kind: string, value: number}]
}

export const ShipValues = {
    stats: `integrity mass engine slots speed movement
        attack defence crew`.replace(/\s+/g, ' ').split(' '),
    desc: `name _id class port captain
        owner`.replace(/\s+/g, ' ').split(' '),
    mods: `size energy`.replace(/\s+/g, ' ').split(' ')
}
export enum ShipClass {A = 'A', B = 'B', C = 'C', D = 'D', E = 'E'}
export class Ship extends ID {
    name: string
    class: ShipClass
    port: string
    captain: ID
    owner: ID
    integrity: number
    mass: number
    engine: number
    speed: number
    movement: number
    size: number
    attack: number
    defence: number
    crew: number
    slots: number
    modules: Module[]
    inventory: Item[]
    location?: Identifier & {pos: Pos}
    img?: string
}

export type PlanetShip = {
    _id: string
    name: string
    class: ShipClass
    img: string
    pos: Pos
}

export enum PlanetType { Frost = 'frost', FrostSat = 'frostsat',
    Jungle = 'jungle', Molten = 'molten', Rocky = 'rocky' }
export type PlanetZone = {
    center: Pos
    radius: number
    img?: string
}
export type PlanetItem = {
    pos: Pos
    type: ResourceType
    amount: number
    owner?: ID
}
export class Planet extends ID {
    zones: PlanetZone[]
    resources: PlanetItem[]
    type: PlanetType
    ships?: PlanetShip[]
}
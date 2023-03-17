import defines from "./defines"

export interface Pos {
    col: number
    row: number
}
export type Location = Identifier & {
    system: string
    pos: Pos
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

export class CorporationRequest {
    resource: ResourceType
    required: number
    filled: number
}

export class Corporation extends ID {
    credit: number
    requests: CorporationRequest[]
}

export enum ItemType {Resource, Coordinates, Ship, Module, Patent, Artifact}
export enum MarketType {None, Sale, Protected}
export class Item extends ID {
    type: ItemType
    owner: ID | null
    location: Location | null
    price: number
    market?: {
        type: MarketType
        price: number
        code: string
    }
    get keys(){ 
        return '_id name type owner location price market'.split(' ') }
    get class(){
        switch (this.type){
            case ItemType.Resource: return Resource;
            case ItemType.Coordinates: return Coordinates;
            case ItemType.Ship: return Ship;
            case ItemType.Module: return Module;
            case ItemType.Patent: return Patent;
            case ItemType.Artifact: return Artifact;
        }
        // unreachable
        throw new Error('Undefined type')
    }
}

export enum ResourceType {Mineral, Energy, Alloy, Crystal, Gas, Particle}
export const ResourceMultiper = {
    [ResourceType.Mineral]: 100,
    [ResourceType.Energy]: 100,
}
export class Resource extends Item {
    type = ItemType.Resource
    kind: ResourceType
    value: number
    data: string
    get cost(){
        return this.value * defines.price.res[this.kind] }
    get keys(){
        return super.keys.concat('kind value data'.split(' ')) }
}

export class Coordinates extends Item {
    type = ItemType.Coordinates
    info: string
    data: Location
    get keys(){
        return super.keys.concat('info data'.split(' ')) }
}

export class Module extends Item {
    type = ItemType.Module
    mass: number
    energy: number
    boosts: [{kind: string, value: number}]
    get keys(){
        return super.keys.concat('mass energy boosts'.split(' ')) }
}

export class Patent extends Item {
    type = ItemType.Patent
    owners: ID[]
    data: string
    get keys(){
        return super.keys.concat('owners data'.split(' ')) }
}

export enum ArtifactType {Bio, Enginering, Anomaly}
export class Artifact extends Item {
    type = ItemType.Artifact
    kind: ArtifactType
    description: string
    get keys(){
        return super.keys.concat('kind description'.split(' ')) }
}

export const ShipValues = {
    stats: `integrity mass engine slots speed movement
        attack defence crew`.replace(/\s+/g, ' ').split(' '),
    desc: `name _id kind port captain
        owner`.replace(/\s+/g, ' ').split(' '),
    mods: `size energy`.replace(/\s+/g, ' ').split(' ')
}
export enum ShipClass {A = 'A', B = 'B', C = 'C', D = 'D', E = 'E'}
export class Ship extends Item {
    type = ItemType.Ship
    kind: ShipClass
    port: string
    captain: ID
    round_cost: number
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
    img?: string
    get keys(){
        return super.keys.concat('kind port captain round_cost '+
            'integrity mass engine speed movement size attack defence '+
            'crew modules inventory img'.split(' '))
    }
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

export class Planet extends ID {
    system: string
    zones: PlanetZone[]
    type: PlanetType
}

export class PlanetInfo extends Planet {
    items?: Item[]
    ships?: PlanetShip[]
}
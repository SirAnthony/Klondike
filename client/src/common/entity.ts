import { filter } from "lodash"

export interface Pos {
    col: number
    row: number
}
export type Location = Identifier & {
    system: string
    pos: Pos
}

export type ResourceCost = {
    kind: ResourceType,
    value: number,
    provided: number
}

export interface Identifier {
    _id?: string
    name: string
}
export class ID implements Identifier {
    _id?: string
    name: string
}

export type Owner = ID & {type: InstitutionType}

export class Order extends ID {
    resourceCost: ResourceCost[]
    cycle: number
    assignee: Owner
    static plan(o: Order){
        return o.resourceCost.reduce((p, r)=>
            p+(r.provided|0)/(r.value||1), 0)/(o.resourceCost.length||1)
    }
    get plan(){ return Order.plan(this) }
    get keys(){ return 'resourceCost cycle assignee'.split(' ') }
    get class(){ return Order }
}

export enum ItemType {Resource, Coordinates, Module, Patent, Artifact}
export const ItemTypePrefix = {
    [ItemType.Resource]: 'R', [ItemType.Coordinates]: 'C',
    [ItemType.Module]: 'M', [ItemType.Patent]: 'P',
    [ItemType.Artifact]: 'A'
}
export enum MarketType {None, Sale, Protected}
export class Item extends ID {
    type: ItemType
    owner: Owner | null
    location: Location | null
    price: number
    data: string
    market?: {
        type: MarketType
        price: number
        code: string
        from: Owner
        to?: Owner
    }
    get keys(){ 
        return '_id name type owner location price data market'.split(' ') }
    get class(){ return Item.class(this.type) }
    static class(type?: ItemType) {
        if (typeof type==='undefined')
            return Item
        switch (type){
            case ItemType.Resource: return Resource;
            case ItemType.Coordinates: return Coordinates;
            case ItemType.Module: return Module;
            case ItemType.Patent: return Patent;
            case ItemType.Artifact: return Artifact;
        }
        // unreachable
        throw new Error(`Undefined type ${type}`)
    }
    constructor(data?: any){
        super()
        Object.assign(this, data)
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
    get keys(){
        return super.keys.concat('kind value'.split(' '))
            .filter(f=>f!='price')
    }
}

export class Coordinates extends Item {
    type = ItemType.Coordinates
    target: Location 
    owners: Owner[]
    get keys(){
        return super.keys.concat('target owners'.split(' '))
            .filter(k=>!['owner'].includes(k))
    }
}

export class Module extends Item {
    type = ItemType.Module
    mass: number
    energy: number
    boosts: [{kind: string, value: number}]
    get keys(){
        return super.keys.concat('mass energy boosts'.split(' ')) }
}

export enum PatentType {Bio, Enginering, Planet}
export enum PatentWeight {Minimal, Basic, Premium}
export enum PatentStatus {Created, Ready, Served}
export enum PatentOwnership {Partial, Full}
export type PatentOwner = Owner & {status: PatentStatus}
export class Patent extends Item {
    type = ItemType.Patent
    kind: PatentType
    weight: PatentWeight
    owners: PatentOwner[]
    resourceCost: ResourceCost[]
    get keys(){
        return super.keys.concat('kind weight owners resourceCost status'
            .split(' ')).filter(k=>!['location', 'owner'].includes(k))
    }
    get ownership(){ 
        return this.fullOwnership ? PatentOwnership.Full : PatentOwnership.Partial }
    get fullOwnership(){ return this.owners.length < 2 }
    get shares(){ return 1/(this.owners.length||1) }
    static ready(p: Patent){
        return !p.owners.some(o=>o.status==PatentStatus.Created) }
    static served(p: Patent, owner: ID){
        return p.owners.some(o=>(''+o._id)==(''+owner._id) &&
            o.status==PatentStatus.Served)
    }
}

export enum ArtifactType {Bio, Enginering, Anomaly}
export class Artifact extends Item {
    type = ItemType.Artifact
    kind: ArtifactType
    get keys(){
        return super.keys.concat('kind'.split(' ')) }
}

export enum InstitutionType {User, Organization, Research, Corporation, Ship}
export const InstitutionTypePrefix = {
    [InstitutionType.User]: 'profile', [InstitutionType.Organization]: 'org',
    [InstitutionType.Research]: 'lab', [InstitutionType.Corporation]: 'corp',
    [InstitutionType.Ship]: 'ship'
}
export class Institution extends ID {
    type: InstitutionType
    credit: number
    data: string
    cost: number
    get keys(){
        return '_id name type data cost'.split(' ')
    }
    get class(){ return Institution.class(this.type) }
    static class(type: InstitutionType){
        if (typeof type==='undefined')
            return Institution
        switch (type){
            case InstitutionType.User: return User;
            case InstitutionType.Organization: return Organization;
            case InstitutionType.Corporation: return Corporation;
            case InstitutionType.Ship: return Ship;
        }
        // unreachable
        throw new Error(`Undefined type ${type}`)
    }
}

export const ProfileFields = {
    fields: `email first_name last_name alias
        phone`.replace(/\s+/g, ' ').split(' '),
    static: ['email'],
}

export enum UserType {None, Corporant, Captain, Mechanic, Navigator, Scientist, Guard, Master}
export class User extends Institution {
    type = InstitutionType.User
    kind: UserType
    alias: string
    first_name: string
    last_name: string
    email: string
    phone: string
    relation: Owner
    info?: string
    get admin(){ return this.kind == UserType.Master }
    get displayName(){
        return this.alias || [this.first_name,
            this.last_name].filter(Boolean).join(' ')
    }
    get fullName(){ return User.fullName(this) }
    static fullName(u: User){
        return [u.first_name, u.alias ? `(${u.alias})` : '',
            u.last_name].filter(Boolean).join(' ')
    }
    get keys(){
        return super.keys.concat(`kind alias first_name last_name email
            phone relation info`.replace(/\s+/g, ' ').split(' '))
            .filter(k=>!['cost'].includes(k))
    }
}

export class Organization extends Institution {
    type = InstitutionType.Organization
    get keys(){
        return super.keys.concat(``.replace(/\s+/g, ' ').split(' '))
    }
}

export enum ResourceSpecialityType {Common, Special, Profile}
export class Corporation extends Institution {
    type = InstitutionType.Corporation
    resourceValue: {[k in ResourceType]: ResourceSpecialityType}
}

export class ResearchLab extends Institution {
    type = InstitutionType.Research
}

export const ShipValues = {
    stats: `integrity mass engine slots speed movement
        attack defence crew`.replace(/\s+/g, ' ').split(' '),
    desc: `name _id kind port captain
        owner`.replace(/\s+/g, ' ').split(' '),
    mods: `size energy`.replace(/\s+/g, ' ').split(' ')
}
export enum ShipClass {A = 'A', B = 'B', C = 'C', D = 'D', E = 'E'}
export class Ship extends Institution {
    type = InstitutionType.Ship
    kind: ShipClass
    owner: Owner | null
    location: Location | null
    price: number
    data: string
    port: string
    captain: ID
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
    img?: string
    get keys(){
        return super.keys.concat(`kind location price data port captain
            integrity mass engine speed movement size attack defence 
            crew modules img`.replace(/\s+/g, ' ').split(' '))
    }
}

export enum FlightType {Planetary, Drone}
export enum FlightStatus {Docked, Waiting, InFlight, SOS, Blocked}
export class Flight extends ID {
    ts: number
    ship?: ID
    type: FlightType
    target: Location
    status: FlightStatus
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
    data: string
    zones: PlanetZone[]
    type: PlanetType
}

export class PlanetInfo extends Planet {
    items?: Item[]
    ships?: PlanetShip[]
}

export enum LogAction {
    PatentPaid, PatentForwardFull, PatentForwardPart, PatentForwardLeftovers,
    ResourceUsed,
    ItemPutSale, ItemRemoveSale, ItemPurchase,
    OrderPay, OrderClosed,
    BonusRating,
    MoneyLeftovers, ResourceLeftovers,
    CycleRating,
}
export class LogEntry extends ID {
    action: LogAction
    owner: Owner
    info: string
    item?: Item
    institution?: Owner
    order?: Order
    ts?: number
    points?: number
    data?: any
}
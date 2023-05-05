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
export const OwnerMatch = (a: Owner, b: Owner)=>
    a && b && ''+a._id==''+b._id && +a.type == +b.type

export class Order extends ID {
    resourceCost: ResourceCost[]
    cycle: number
    owner: Owner
    cost: number
    static plan(o: Order){
        return o.resourceCost.reduce((p, r)=>
            p+(r.provided|0)/(r.value||1), 0)/(o.resourceCost.length||1)
    }
    get plan(){ return Order.plan(this) }
    get keys(){ return '_id resourceCost cycle owner'.split(' ') }
    get class(){ return Order }
}

export enum ItemType {Resource, Coordinates, Module, Patent, Artifact}
export const ItemTypePrefix = {
    [ItemType.Resource]: 'R', [ItemType.Coordinates]: 'C',
    [ItemType.Module]: 'M', [ItemType.Patent]: 'P',
    [ItemType.Artifact]: 'A'
}
export enum MarketType {None, Sale, Protected, Loan}
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
}

export class MultiOwnedItem extends Item {
    owners: Owner[]
    get keys(){
        return super.keys.concat('owners').filter(k=>k!='owner') }
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
    known?: boolean
    get keys(){
        return super.keys.concat('kind value'.split(' '))
            .filter(f=>f!='price')
    }
}

export class Coordinates extends MultiOwnedItem {
    type = ItemType.Coordinates
    target: Location 
    get keys(){
        return super.keys.concat('target'.split(' ')) }
}

export enum ModStat {None, Integrity, Mass, Engine, Slots,
    Speed, Movement, Size, Attack, Defence, Crew, Energy,
    Research, ResearchZone}
export type ModuleBoosts = {[key in ModStat]: number}
export class Module extends Item {
    type = ItemType.Module
    mass: number
    energy: number
    installed: boolean
    boosts: ModuleBoosts
    get keys(){
        return super.keys.concat('mass energy installed boosts'.split(' ')) }
}

export enum PatentType {Bio, Enginering, Planet}
export enum PatentWeight {Minimal, Basic, Premium}
export enum PatentOwnership {Partial, Full}
export class Patent extends MultiOwnedItem {
    type = ItemType.Patent
    kind: PatentType
    weight: PatentWeight
    owners: Owner[]
    resourceCost: ResourceCost[]
    ready: boolean
    served: Owner[]
    get keys(){
        return super.keys.concat('kind weight resourceCost served ready'
            .split(' ')).filter(k=>!['location'].includes(k))
    }
    get ownership(){ 
        return this.fullOwnership ? PatentOwnership.Full : PatentOwnership.Partial }
    get fullOwnership(){ return this.owners.length < 2 }
    get shares(){ return 1/(this.owners.length||1) }
    static served(p: Patent, owner: Owner){
        return p.served?.some(o=>OwnerMatch(o, owner)) }
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
    img?: string
    get keys(){
        return '_id name type data credit cost img'.split(' ')
    }
    get class(){ return Institution.class(this.type) }
    static class(type: InstitutionType){
        if (typeof type==='undefined')
            return Institution
        switch (type){
            case InstitutionType.User: return User;
            case InstitutionType.Organization: return Organization;
            case InstitutionType.Research: return Corporation;
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

export enum UserType {
    None      = 0,
    Corporant = 1 << 0,
    Captain   = 1 << 1,
    Mechanic  = 1 << 2,
    Navigator = 1 << 3,
    Scientist = 1 << 4,
    Guard     = 1 << 5,
    Master    = 1 << 6
}

export const UserTypeIn = (user: User, type: UserType, ...args: UserType[])=>
    [type, ...args].some(t=>+user.kind & t)

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
    get admin(){ return UserTypeIn(this, UserType.Master) }
    get displayName(){
        return this.alias || [this.first_name,
            this.last_name].filter(Boolean).join(' ')
    }
    get fullName(){ return User.fullName(this) }
    static fullName(u: User){
        return u.type!=InstitutionType.User ? u.name : [u.first_name,
            u.alias ? `(${u.alias})` : '', u.last_name].filter(Boolean).join(' ')
    }
    get keys(){
        return super.keys.concat(`kind alias first_name last_name email
            phone relation info`.replace(/\s+/g, ' ').split(' '))
            .filter(k=>!['cost'].includes(k))
    }
}

export class Organization extends Institution {
    type = InstitutionType.Organization
}

export enum ResourceSpecialityType {Common, Special, Profile}
export type ResourceValueInfo = {[k in ResourceType]: ResourceSpecialityType}
export class Corporation extends Institution {
    type = InstitutionType.Corporation
    resourceValue: ResourceValueInfo
    get keys(){
        return super.keys.concat(`resourceValue`.replace(/\s+/g, ' ').split(' '))
    }
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
    port: string
    captain: Owner | null
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
    flight?: ID
    known?: {[k: string]: string[]}
    get keys(){
        return super.keys.concat(`kind location price port captain
            integrity mass engine speed movement size attack defence 
            crew `.replace(/\s+/g, ' ').split(' '))
    }
}

export enum FlightStatus {Docked, Waiting, InFlight, SOS, Blocked, Research}
export enum FlightType {
    Drone     = 1 << 0,
    Planetary = 1 << 1,
    // Emergency is planetary-only
    Emergency = (1 << 2) | (1 << 1),
}
export enum FlightKind {Normal, Scietific}
export class Flight extends ID {
    ts: number
    type: FlightType
    status: FlightStatus
    kind?: FlightKind
    departure?: number
    arrival?: number
    visit?: number
    owner?: Owner
    location?: Location
    points?: Pos[]
    get keys(){
        return `ts type status owner location`.split(' ') }
    get class(){ return Flight }
    static Name(flight: Flight){
        return `type_${flight.type} status_${flight.status}` }
}

export type PlanetShip = {
    _id: string
    name: string
    type: InstitutionType
    kind: ShipClass
    img: string
    location: Location
}

export enum PlanetType { Frost = 'frost', FrostSat = 'frostsat',
    Jungle = 'jungle', Molten = 'molten', Rocky = 'rocky' }
export type PlanetZone = {
    center: Pos
    radius: number
    img?: string
}
export type PlanetFog = {
    owner: Owner
    location: Location
    data: {[k: string]: boolean}
}

export class Planet extends ID {
    type: PlanetType
    system: string
    data: string
    zones: PlanetZone[]
    static class(type?: PlanetType){ return Planet }
    get class(){ return Planet.class(this.type) }
    get keys(){
        return `_id name type system data zones`
            .replace(/\s+/g, ' ').split(' ')
    }
}

export class PlanetInfo extends Planet {
    items?: Item[]
    ships?: PlanetShip[]
    pos?: {
        items: {[k: string]: Item[]},
        ships: {[k: string]: PlanetShip[]}
    }
    fog?: string[]
    drop?: string[]
}

export enum ExpenseType {Loan, Fine}
class Expense extends ID {
    ts: number
    type: ExpenseType
    amount: number
    creditor: Owner
    filled: boolean
}

export class Loan extends Expense {
    type = ExpenseType.Loan
    lender: Owner
}

export class Fine extends Expense {
    type = ExpenseType.Fine
}

export enum LogAction {
    PatentPaid, PatentForwardFull, PatentForwardPart, PatentForwardLeftovers,
    ResourceUsed,
    ItemPutSale, ItemRemoveSale, ItemPurchase,
    OrderPay, OrderClosed,
    LoanPay, LoanProvided, LoanProposeItem, LoanProposeReject,
    FineCycleClose, LoanCycleClose, CostCycleClose,
    BonusRating,
    MoneyLeftovers, ResourceLeftovers,
    FlightAction, FlightSignup, FlightDelist, FlightBlock, FlightUnblock,
    FlightDeparture, FlightArrival, FlightHelp, FlightDock,
    FlightMovement, FlightResearchDone,
    CycleRating, 
}
export class LogEntry extends ID {
    action: LogAction
    owner: Owner
    info: string
    item?: Item
    institution?: Owner
    order?: Order
    flight?: Flight
    ts?: number
    points?: number
    data?: any
    cycle: number
}
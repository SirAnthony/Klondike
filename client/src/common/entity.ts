
export interface Identifier {
    _id?: string
}

export const Profile = {
    fields: `email first_name second_name last_name alias
        phone age`.replace(/\s+/g, ' ').split(' '),
    static: ['email'],
}

export enum UserType {Base, Partial, Free}
export class UserID implements Identifier {
    _id?: string
    alias: string
}
export class User extends UserID {
    first_name: string
    second_name: string
    last_name: string
    email: string
    age: number
    gender: string
    phone: string
    admin: boolean
    credit: number
    debt: number
    type: UserType
    get displayName(){
        return this.alias || [this.first_name,
            this.last_name].filter(Boolean).join(' ')
    }
    get fullName(){
        return [this.first_name, this.alias ? `(${this.alias})` : '',
            this.second_name, this.last_name].filter(Boolean).join(' ')
    }
}

export enum RoomType {
    None = 'Нет',
    Economy = 'Эконом',
    Standard = 'Стандарт',
    SemiLuxe = 'Полулюкс',
    Luxe = 'Люкс',
    Foam = 'Без кровати'
}
export enum RoomStatus {
    Empty = 'a',
    Occupied = 'b',
    Booked = 'c',
    Own = 'd',
    OwnHighlight = 'e',
    Vacant = 'f',
}
export class RoomBase implements Identifier {
    _id?: string
    bid: number
    floor: number
    name: string | number
    type: RoomType
}

export class RoomData extends RoomBase {
    admin?: boolean
    beds: number
}

export enum OrderType {Entry, Tent, Place, Foam, Full}
export const OrderInside = [OrderType.Foam, OrderType.Place, OrderType.Full]
export const OrderFull = [RoomType.SemiLuxe, RoomType.Luxe]
export enum OrderStatus {None, Credit, Paid}
export class OrderCount {
    type: OrderType
    user: Identifier
}
export class OrderBase extends OrderCount {
    room?: RoomBase
    pass?: string
    early?: boolean
}
export class Order extends OrderBase implements Identifier {
    _id?: string
    date: Date
    updated: Date
    status: OrderStatus = OrderStatus.None
}

export enum MealName {breakfast = 'breakfast', lunch = 'lunch', dinner = 'dinner'}
export enum MealDay {thu = 'thursday', fri = 'friday', sat = 'saturday', sun = 'sunday'}
export const Meal = {NAMES: {
    [MealName.breakfast]: 'Завтрак',
    [MealName.lunch]: 'Обед',
    [MealName.dinner]: 'Ужин',
}, DAYS: {
    [MealDay.thu]: 'Четверг',
    [MealDay.fri]: 'Пятница',
    [MealDay.sat]: 'Суббота',
    [MealDay.sun]: 'Воскресенье'
}, LAYOUT: {
    [MealDay.thu]: [MealName.dinner],
    [MealDay.fri]: [MealName.breakfast, MealName.lunch, MealName.dinner],
    [MealDay.sat]: [MealName.breakfast, MealName.lunch, MealName.dinner],
    [MealDay.sun]: [MealName.breakfast],
}}

export type MealOptions = {[key in MealDay]: MealName[]}
export class Options implements Identifier {
    _id?: string
    user: Identifier
    date: Date
    parking: boolean
    meal: MealOptions

    // Require hack
    static _price
    static get Price(){
        if (!Options._price)
            Options._price = require('./defines').Price
        return Options._price 
    }
    get credit(){ return Options.credit(this.meal) }
    static credit(meal){
        if (!meal)
            return 0
        return Object.keys(meal).reduce((p, k)=>
            p+(meal[k]||[]).reduce((pp, d)=>pp+Options.Price.meal[d], 0), 0)
    }
    setMeal(day: MealDay, name: MealName, val: boolean){
        if (!this.meal)
            this.meal = {} as MealOptions
        const arr = this.meal[day] = this.meal[day]||[]
        if (val && !arr.includes(name))
            this.meal[day] = arr.concat(name)
        if (!val && arr.includes(name))
            this.meal[day] = arr.filter(f=>f!=name)
    }
}



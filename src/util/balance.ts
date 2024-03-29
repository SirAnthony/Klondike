import {
    Coordinates, ExpenseType, InstitutionType, ItemType,
    LogAction, Patent, ResourceCost, Resource, Owner, OwnerMatch
} from '../../client/src/common/entity';
import {
    CorpController, InstitutionController, LoanController,
    LogController,
    OrderController,
    UserController
} from '../entity'
import {
    ItemController, ShipController, institutionController
} from '../entity';
import {IDMatch, asID} from './server';
import * as rating from './rating'
import * as Time from './time'
import { ApiError, Codes } from '../../client/src/common/errors';

export async function pay_with_resource(resource: ItemController,
    target: {resourceCost: ResourceCost[]}, owner: Owner, info: string){
    const res = (resource as unknown) as Resource
    const {value} = res
    target.resourceCost.forEach(k=>k.provided |= 0)
    for (let k of target.resourceCost){
        if (!res.value)
            break
        if (k.kind!=res.kind || k.value<=k.provided)
            continue
        let amount = Math.min(res.value, k.value-k.provided)
        k.provided += amount
        res.value -= amount
    }
    const used = value != res.value
    // Resource is single-used
    if (used) {
        // Delist from market
        res.market = null
        await LogController.log({
            name: 'resource_used', info,
            owner: owner, item: res, points: 0,
            data: {value}, action: LogAction.ResourceUsed
        })
        res.value = 0
        // Should delete?
        await resource.save()
    }
    return used
}

export async function buy_item(src: InstitutionController, item: ItemController) {
    const {market} = item
    if (IDMatch(market.from._id, market.to?._id))
        throw 'Cannot buy owned item'
    const price = item.market.price
    if ((src.credit|0) < market.price)
        throw new ApiError(Codes.INCORRECT_PARAM, 'error_no_funds')
    const dst = await (institutionController(market.from.type)).get(market.from._id)
    dst.credit = (dst.credit|0) + price
    src.credit = (src.credit|0) - price
    if (item.type==ItemType.Patent) {
        const pt = (item as unknown) as Patent
        pt.owners = pt.owners.filter(o=>!OwnerMatch(o, dst) &&
            !OwnerMatch(o, src)).concat(src.asOwner)
        // Add points if last part bought
        await rating.patent_points(item, src, pt.served)
    } else if (item.type==ItemType.Coordinates) {
        const pt = (item as unknown) as Coordinates
        pt.owners = pt.owners.filter(o=>!OwnerMatch(o, src)).concat(src.asOwner)
    } else {
        item.owner = src.asOwner }
    item.market = null
    await src.save()
    await dst.save()
    await item.save()
    await LogController.log({
        name: 'item_buy', info: 'buy_item',
        owner: src.asOwner, item: Object.assign({price}, item.asObject),
        action: LogAction.ItemPurchase
    })
}

export async function funds_transfer(src: InstitutionController, dst: InstitutionController, value: number){
        // Do not provide loan between users
        //if (+src.type!=InstitutionType.User && +dst.type!==InstitutionType.User)
        //    await provide_loan(src.asOwner, dst.asOwner, value)
        src.credit = (src.credit|0) - value
        dst.credit = (dst.credit|0) + value
        await src.save()
        await dst.save()
        await LogController.log({action: LogAction.FundsTransfer,
            name: 'funds_transfer', info: `${src.name} -> ${dst.name} ${value}`,
            owner: src.asOwner, institution: dst.asOwner, data: {value}})
 }

export async function provide_loan(src: Owner, dst: Owner, value: number){
    const reverse = await LoanController.find({filled: {$ne: true},
        'lender._id': asID(dst._id), 'lender.type': +dst.type,
        'creditor._id': asID(src._id), 'creditor.type': +src.type})
    if (reverse) {
        const val = Math.min(reverse.amount, value)
        reverse.amount -= val
        value -= val
        reverse.filled = !reverse.amount
        await reverse.save()
        await LogController.log({action: LogAction.LoanPay,
            name: 'loan_pay', info: 'loan_pay_reverse', data: {loan: reverse, amount: val},
            owner: src, institution: dst})
    }
    if (!value)
        return
    const loan = (await LoanController.find({filled: {$ne: true},
        'lender._id': asID(src._id), 'lender.type': +src.type,
        'creditor._id': asID(dst._id), 'creditor.type': +dst.type
    })) || LoanController.create(src, dst)
    loan.amount = (loan.amount|0) + value
    await loan.save()
    await LogController.log({action: LogAction.LoanPay,
        name: 'loan_take', info: 'loan_take', data: {loan, amount: value},
        owner: src, institution: dst})
}

export async function close_loan(src: InstitutionController, loan: LoanController, log?: any) {
    const amount = loan.amount|0
    const dst = await institutionController(+loan.lender.type).get(loan.lender._id)
    src.credit = (src.credit|0)-amount
    dst.credit = (dst.credit|0)+amount
    loan.amount = 0
    loan.filled = true
    await src.save()
    await dst.save()
    await loan.save()
    await LogController.log(Object.assign({action: LogAction.LoanCycleClose,
        name: 'close_loan', info: `close_loan`, data: {loan, amount, cycle: log.cycle},
        owner: src.asOwner, institution: dst.asOwner}, log))
}

export async function close_with_item(src: InstitutionController, item: ItemController){
    const price = item.market.price
    const loan = await LoanController.get(item.market.code)
    if (!IDMatch(loan?.lender?._id, src._id))
        throw 'Wrong owner'
    item.owner = src.asOwner
    item.market = null
    await item.save()
    loan.amount = 0
    loan.filled = true
    await loan.save()
    await LogController.log({action: LogAction.LoanPay, item,
        name: 'loan_pay_item', info: 'put_item_close_loan',
        owner: loan.creditor, institution: src.asOwner})
}

async function calcExpenses(entity: InstitutionController, expenses: LoanController[], cycle: number){
    const own = expenses.filter(f=>
        f.creditor.type==entity.type && IDMatch(f.creditor._id, entity._id))
    const fines = own.filter(f=>f.type==ExpenseType.Fine)
    // const loans = own.filter(f=>f.type==ExpenseType.Loan)
    for (let fine of fines){
        const amount = fine.amount|0
        entity.credit = (entity.credit|0) - amount
        fine.filled = true
        await fine.save()
        await entity.save()
        await LogController.log({action: LogAction.FineCycleClose,
            name: 'fine_close', info: `calcExpenses ${cycle}`,
            owner: entity.asOwner, data: {fine, amount, cycle}})
    }
    // for (let loan of loans)
    //    await close_loan(entity, loan, {info: `calcExpenses ${cycle}`, cycle})
    // Add finances from next cycle orders
    const orders = await OrderController.all({'owner._id': asID(entity._id),
        'owner.type': +entity.type, cycle: cycle+1})
    for (let o of orders)
        entity.credit = (entity.credit|0) + o.cost
    if (orders.length)
        await entity.save()
    // Reduce expenses for ships
    if (entity.type == InstitutionType.Ship){
        const cost = entity.cost|0
        entity.credit = (entity.credit|0) - cost
        await entity.save()
        await LogController.log({action: LogAction.CostCycleClose,
            name: 'cost_close', info: `calcExpenses ${cycle}`,
            owner: entity.asOwner, data: {cost, cycle}})
    }
}

async function cycleBalance(cycle: number){
    const expenses = await LoanController.all({filled: {$ne: true}})
    // All corporations, organizations, lags
    const corps = await CorpController.all();
    const ships = await ShipController.all();
    const users = await UserController.all();
    for (let corp of corps)
        await calcExpenses(corp, expenses, cycle)
    for (let ship of ships)
        await calcExpenses(ship, expenses, cycle)
    for (let user of users)
        await calcExpenses(user, expenses, cycle)
}

Time.addCycleEvent(cycleBalance)
import {ExpenseType, InstitutionType, Loan, LogAction} from '../../client/src/common/entity';
import {ResourceCost, Resource, Owner} from '../../client/src/common/entity';
import {CorpController, LoanController, LogController} from '../entity'
import {ItemController, ShipController, institutionController} from '../entity';
import * as Time from './time'

export async function pay_with_resource(resource: ItemController,
    target: {resourceCost: ResourceCost[]}, owner: Owner, info: string){
    const res = (resource as unknown) as Resource
    const {value} = res
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

export async function provide_loan(src: Owner, dst: Owner, value: number){
    const reverse = await LoanController.find({filled: {$ne: true},
        'lender._id': dst._id, 'lender.type': dst.type,
        'creditor._id': src._id, 'creditor.type': src.type})
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
        'lender._id': src._id, 'lender.type': src.type,
        'creditor._id': dst._id, 'creditor.type': dst.type
    })) || LoanController.create(src, dst)
    loan.amount = (loan.amount|0) + value
    await loan.save()
    await LogController.log({action: LogAction.LoanPay,
        name: 'loan_take', info: 'loan_take', data: {loan, amount: value},
        owner: src, institution: dst})
}

export async function close_loan(src: CorpController | ShipController, loan: LoanController, log?: any) {
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

async function calcExpenses(entity: CorpController | ShipController, expenses: LoanController[], cycle: number){
    const own = expenses.filter(f=>
        f.creditor.type==entity.type && f.creditor._id==entity._id)
    const fines = own.filter(f=>f.type==ExpenseType.Fine)
    const loans = own.filter(f=>f.type==ExpenseType.Loan)
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
    for (let loan of loans)
        await close_loan(entity, loan, {info: `calcExpenses ${cycle}`, cycle})
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
    for (let corp of corps)
        await calcExpenses(corp, expenses, cycle)
    for (let ship of ships)
        await calcExpenses(ship, expenses, cycle)
}

Time.addCycleEvent(cycleBalance)
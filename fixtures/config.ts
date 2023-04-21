import {ConfigController} from '../src/entity'
import * as entity from '../client/src/common/entity'

const config = {
    points: {
        patent_close: 100,
        patent_pay: 100,
        patent: {
            pay: 100,
            [entity.PatentOwnership.Full]: {
                [entity.PatentWeight.Minimal]: -10,
                [entity.PatentWeight.Basic]: 10,
                [entity.PatentWeight.Premium]: 20
            },
            [entity.PatentOwnership.Partial]: {
                [entity.PatentWeight.Minimal]: -10,
                [entity.PatentWeight.Basic]: 15,
                [entity.PatentWeight.Premium]: 30
            }
        },
        order: {
            [entity.ResourceSpecialityType.Common]: 5,
            [entity.ResourceSpecialityType.Special]: 7,
            [entity.ResourceSpecialityType.Profile]: 10,
            open: -3
        }
    },
    price: {
        res: {

        }
    }
}

export const Fixtures = config

export default async function load() {
    let prev
    try {
        prev = await ConfigController.get() }
    catch (err){
        try { await ConfigController.create() } catch { } }
    const s = prev || Fixtures
    await ConfigController.save(s)

}

if (module.parent==undefined)
    load()
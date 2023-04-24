import {ConfigController} from '../src/entity'
import * as entity from '../client/src/common/entity'
import {Config} from '../client/src/common/config'

const config : Config = {
    points: {
        patent: {
            pay: 100,
            close: 0,
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
        res: [{
            [entity.ResourceType.Alloy]: 200,
            [entity.ResourceType.Crystal]: 200,
            [entity.ResourceType.Energy]: 30,
            [entity.ResourceType.Gas]: 200,
            [entity.ResourceType.Mineral]: 200,
            [entity.ResourceType.Particle]: 200,
        }]
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
    if (!Array.isArray(s.price.res))
        s.price.res = Fixtures.price.res
    await ConfigController.save(s)

}

if (module.parent==undefined)
    load()
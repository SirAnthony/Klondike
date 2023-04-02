import {Corporation, CorporationType} from '../client/src/common/entity'
import {CorpController} from '../src/entity'

export enum CorpAlias {AP = 'AP', R = 'R', WY = 'WY', USC = 'USC', EF = 'EF'}
export class CorpFixture extends Corporation {
    alias: CorpAlias
}

const corps: CorpFixture[] = [{
    name: 'Amalgam Pharmaceuticals',
    credit: 25000,
    alias: CorpAlias.AP,
    type: CorporationType.Normal,
    points: [],
}, {
    name: 'Rakuza',
    credit: 25000,
    alias: CorpAlias.R,
    type: CorporationType.Normal,
    points: [],
}, {
    name: 'Wayne-Yuanti',
    credit: 25000,
    alias: CorpAlias.WY,
    type: CorporationType.Normal,
    points: [],
}, {
    name: 'Union Spacecraft Corporation, USC',
    credit: 25000,
    alias: CorpAlias.USC,
    type: CorporationType.Normal,
    points: [],
}, {
    name: 'Земная федерация',
    credit: 25000,
    alias: CorpAlias.EF,
    type: CorporationType.Research,
    points: [],
},]

class CorpControllerFixture extends CorpController {
    constructor(data: Corporation) {
        super(data)
    }
}

export const Fixtures = corps

export default async function load() {
    for (let corp of corps) {
        const prev = await CorpController.find({name: corp.name})
        if (prev) {
            for (let k in corp) {
                if (k == 'alias')
                    continue
                prev[k] = corp[k]
            }
        }
        const s = prev || new CorpControllerFixture(corp)
        await s.save()
    }
}

if (module.parent==undefined)
    load()
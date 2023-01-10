import { exit } from 'process'
import {default as corps} from './corps'
import {default as ships} from './ships'
import {default as planets} from './planets'

async function load() {
    await corps()
    await ships()
    await planets()
    exit(0)
}

if (module.parent==undefined)
    load()
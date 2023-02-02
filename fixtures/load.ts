import { exit } from 'process'
import {default as corps} from './corps'
import {default as ships} from './ships'
import {default as planets} from './planets'
import {default as users} from './users'

async function load() {
    await corps()
    await ships()
    await planets()
    await users()
    exit(0)
}

if (module.parent==undefined)
    load()
import { exit } from 'process'
import {default as corps} from './corps'
import {default as ships} from './ships'
import {default as planets} from './planets'
import {default as users} from './users'
import {default as resources} from './resources'
import {default as config} from './config'

async function load() {
    await corps()
    await ships()
    await planets()
    await users()
    await resources()
    await config()
    exit(0)
}

if (module.parent==undefined)
    load()
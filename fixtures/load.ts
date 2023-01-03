import { exit } from 'process'
import {default as corps} from './corps'
import {default as ships} from './ships'

async function load() {
    await corps()
    await ships()
    exit(0)
}

if (module.parent==undefined)
    load()
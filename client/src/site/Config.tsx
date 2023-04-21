import React from 'react'
import * as F from '../Fetcher'
import {Config} from '../common/config'
import {InventoryEvents, InventoryEventType as IET} from '../inventory'

type ConfigState = {
    config: Config
}

export class ConfigFetcher<P, S> extends F.Fetcher<P, ConfigState & S> {
    cacheClass = ConfigFetcher
    constructor(props){
        super(props)
        this.state = {} as any
        InventoryEvents.onreloadPrices(()=>{
            this.cacheClass._cache = undefined
            this.fetch()
        })
    }
    get fetchUrl() { return '/api/config' }
    fetchState(data: any = {}){
        return {item: data, config: data.data}
    }
}
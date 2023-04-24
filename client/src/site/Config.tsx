import * as F from '../Fetcher'
import {Config} from '../common/config'
import {InventoryEvents} from '../inventory'
import * as util from '../common/util'

type ConfigState = {
    conf: Config
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
    async onSubmit(){
        const {item} = this.state
        this.setState({err: null})
        const ret = await util.wget('/api/admin/config', {method: 'POST',
            data: {conf: item}})
        if (ret.err)
            return this.setState({err: ret.err as any})
        InventoryEvents.reloadConfig()      
    }
}
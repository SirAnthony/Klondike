import React from 'react'
import * as RB from 'react-bootstrap'
import * as F from '../Fetcher'
import {Ship, Module, ShipValues} from '../common/entity'
import * as util from '../common/util'
import {default as L, LR} from './locale'

function Mod(num: number, mod: Module, onRemove: (mod: Module)=>void){
    if (!mod)
        return [<tr><td>{L('mod_empty')}</td><td></td><td></td></tr>]
    const values = ShipValues.mods.map(k=><tr>
      <td>{L('mod_stat', k)}</td>
      <td>{L('mod_stat_c', k)}</td>
      <td>{mod[k]}</td>
    </tr>).concat(mod.boosts.map(k=><tr>
      <td>{L('mod_stat', k.kind)}</td>
      <td>{L('mod_stat_c', k.kind)}</td>
      <td>{k.value}</td>
    </tr>))
    return [<tr>
      <td>{L('mod_slot')+' '+num}</td>
      <td>
        <RB.Button onClick={()=>onRemove(mod)}>{LR('act_remove')}</RB.Button>
      </td>
    </tr>,
    <tr>
      <td>{mod.name}</td>
    </tr>, ...values]
}

type ModuleDetailsState = {
    list?: Module[]
}
type ModuleDetailsProps = {
    ship: Ship
}

export class ModuleDetails extends F.Fetcher<ModuleDetailsProps, ModuleDetailsState> {
    constructor(props){
        super(props)
        this.state = {}
        this.removeModule = this.removeModule.bind(this)
    }
    get fetchUrl() {
        const {ship} = this.props
        return `/api/ship/${ship?._id}/modules`
    }
    fetchState(data: any = {}){
        const {ship} = data
        return {item: data, ship}
    }
    async removeModule(mod: Module){
        const {ship} = this.props
        const ret = await util.wget(`/api/ship/${ship._id}/module/${mod._id}/remove`)
        if (ret.err)
            return void this.setState({err: ret.err})
        this.fetch()
        return true
    }
    render(){
        const {ship} = this.props
        const {list} = this.state
        const modules = list?.filter(m=>m.installed).slice(0, ship.slots)||[]
        for (let i=0; i<ship.slots; i++)
            modules[i] = modules[i]||null
        const rows = modules.map((m, i)=>Mod(i, m, this.removeModule)).flat()
        return <div className="menu-box"><table>
          <tr>
            <th colSpan={2}>{L('mod_title')}</th>
            <th>{L('mod_values')}</th>
          </tr>
          {rows}
        </table></div>
    }
}



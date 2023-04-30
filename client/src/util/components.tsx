import {Item, ItemTypePrefix, Resource} from '../common/entity'
import * as urls from '../common/urls'
import L from '../common/locale'

export function IDField(props: {item: Item}){
    const {item} = props
    const {_id, type} = item
    const str = [ItemTypePrefix[type], _id.slice(0, 6)].join('-')
    return <span className='field-id wrap-anywhere'>{str}</span>
}

export function Delimeter(){
    return <hr className='delimeter' />
}

export function ResourceImg(props: {res: Resource}){
    const {res} = props
    return <img src={urls.Images.item(res)} alt={L(`res_kind_${res.kind}`)} />
}
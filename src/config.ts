import common from '../client/src/common/config'
import * as secrets from '../secrets.json'

export default Object.assign({
    debug: {db: true},
    static_dir: __dirname+'/../static',
    static_url: '/static',
    client_static: __dirname+'/../client/build/static',
    client_url: '/client',
}, common, secrets)
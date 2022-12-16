
function encode_uri_comp(s){
    return encodeURIComponent(s).replace(/%20/g, '+') }

export function qs_escape(param, opt: any = {}){
    let qs = opt.qs||''
    let sep = qs || opt.amp ? '&' : ''
    if (!param)
        return qs
    for (let i in param){
        const val = param[i]
        if (val===undefined)
            continue
        const key = encode_uri_comp(i)
        qs += sep
        if (val===null)
            qs += key;
        else if (Array.isArray(val)){
            if (!val.length)
                continue
            qs += val.map(val=>key+'='+encode_uri_comp(val)).join('&');
        } else
            qs += key+'='+encode_uri_comp(val);
        sep = '&';
    }
    return qs;
}

export function uri(url, qs, hash?){
    qs = qs_escape(qs)
    hash = hash ? '#'+qs_escape(hash) : ''
    return url+qs+hash
}

const compact_array = a=>{
    var i, j, n = a.length;
    for (i=0; i<n && a[i]; i++);
    if (i==n)
        return a;
    for (j=i; i<n; i++)
    {
        if (!a[i])
            continue;
        a[j++] = a[i];
    }
    a.length = j;
    return a;
};

const split_trim = (s, sep, lim?)=>compact_array(s.split(sep, lim))
const es6_str = function(args){
    var parts = args[0], s = '';
    if (!Array.isArray(parts))
        return parts;
    s += parts[0];
    for (var i = 1; i<parts.length; i++)
    {
        s += args[i];
        s += parts[i];
    }
    return s;
};
export function qw(s: TemplateStringsArray){
    if (Array.isArray(s) && !s.raw)
        return s
    return split_trim(!Array.isArray(s) ? s : es6_str(arguments), /\s+/);
}

export function clear_email(email: string){
    email = email.trim().toLowerCase()
    let [username, domain] = email.split('@')
    username = username.replace(/\./g, '').split('+')[0]
    return `${username}@${domain}`
}

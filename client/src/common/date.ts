import config from './config'

export const sec = {
    NANO: 1/1e9,
    MS: 0.001,
    SEC: 1,
    MIN: 60,
    HOUR: 60*60,
    DAY: 24*60*60,
    WEEK: 7*24*60*60,
    MONTH: 30*24*60*60,
    YEAR: 365*24*60*60,
};
export const ms: any = Object.keys(sec).reduce((p, n)=>{
    p[n] = sec[n]*1000
    return p
}, {})

export const get = (d?: Date | string | number | null, _new?: boolean)=>{
    let y, mon, day, H, M, S, _ms;
    if (d===undefined)
        return new Date();
    if (d==null)
        return new Date(null);
    if (d instanceof Date)
        return _new ? new Date(d) : d;
    if (typeof d=='string'){
        let m = /^(\d{4})-(\d\d)-(\d\d)\s*([\sT](\d\d):(\d\d)(:(\d\d)(\.(\d{3}))?)?Z?)?$/.exec(d);
        d = d.trim();
        // check for ISO/SQL date
        if (m){
            H = +m[5]||0; M = +m[6]||0; S = +m[8]||0; _ms = +m[10]||0;
            y = +m[1]; mon = +m[2]; day = +m[3];
            if (!y && !mon && !day && !H && !M && !S && !_ms)
                return new Date(NaN);
            return new Date(Date.UTC(y, mon-1, day, H, M, S, _ms));
        }
        // check for string timestamp
        if (/^\d+$/.test(d))
            return new Date(+d);
        // else might be parsed as non UTC!
        return new Date(d);
    }
    if (typeof d=='number')
        return new Date(d);
}

export const add = (d, dur)=>{
    d = get(d, true);
    dur = normalize_dur(dur);
    if (dur.year)
        d.setUTCFullYear(d.getUTCFullYear()+(+dur.year));
    if (dur.month)
        d.setUTCMonth(d.getUTCMonth()+(+dur.month));
    ['day', 'hour', 'min', 'sec', 'ms'].forEach(function(k){
        if (dur[k])
            d.setTime(+d+dur[k]*ms[k.toUpperCase()]);
    });
    return d;
}

function normalize_dur(dur){
    var aliases = {
        years: 'year', months: 'month', days: 'day', hours: 'hour',
        minutes: 'min', minute: 'min', mins: 'min',
        seconds: 'sec', second: 'sec', secs: 'sec',
        y: 'year', mo: 'month', d: 'day', h: 'hour', m: 'min', s: 'sec',
    };
    var norm = {};
    for (var k in dur)
        norm[aliases[k]||k] = dur[k];
    return norm;
}

export const diff = (a, b, period = ms.DAY)=>
    Math.ceil((+get(a) - +get(b)) / period)
export const weekday = d=>
    get(d).toLocaleDateString(config.locale, {weekday: 'long'})
export const longdate = d=>get(d).toLocaleDateString(
    config.locale, {weekday: 'long', day: 'numeric', month: 'long'})
export const daymonth = d=>get(d).toLocaleDateString(
    config.locale, {day: 'numeric', month: 'long'})
export const time = d=>get(d).getHours()+':'+String(get(d).getMinutes()).padStart(2, '0')
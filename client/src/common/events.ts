
type Event = {
    fn: Function
    context?: any
    once?: boolean
}

type listener_opt = {
    context?: any
    once?: boolean
    prepend?: boolean
}

export default function EventEmitter(){ this._events = {} }

EventEmitter.prototype.listeners = function listeners(name: string){
    var events = this._events && this._events[name] || []
    var length = events.length, listeners = [], event
    for (var i = 0; i<length; event = events[++i])
        listeners.push(events[i].fn)
    return listeners
}

EventEmitter.prototype.emit = function emit(name: string, a1, a2, a3, a4, a5){
    if (!this._events || !this._events[name])
        return false
    var listeners = this._events[name], length = listeners.length
    var len = arguments.length, event = listeners[0], args, i
    if (length===1) {
        switch (len) {
        case 1:
            event.fn.call(event.context||this)
            break
        case 2:
            event.fn.call(event.context||this, a1)
            break
        case 3:
            event.fn.call(event.context||this, a1, a2)
            break
        case 4:
            event.fn.call(event.context||this, a1, a2, a3)
            break
        case 5:
            event.fn.call(event.context||this, a1, a2, a3, a4);
            break
        case 6:
            event.fn.call(event.context||this, a1, a2, a3, a4, a5)
            break
        default:
            for (i = 1, args = new Array(len-1); i<len; i++)
                args[i-1] = arguments[i]
            event.fn.apply(event.context||this, args)
        }
        if (event.once)
            remove_listener.apply(this, [name, event])
    } else {
        for (i = 1, args = new Array(len-1); i<len; i++)
            args[i-1] = arguments[i];
        for (i = 0; i<length; event = listeners[++i]) {
            event.fn.apply(event.context||this, args)
            if (event.once)
                remove_listener.apply(this, [name, event]);
        }
    }
    return true
}

function add_listener(name: string, fn: Function, opt: listener_opt = {}){
    if (!this._events)
        this._events = {};
    if (!this._events[name])
        this._events[name] = []
    var event: Event = {fn}
    if (opt.context)
        event.context = opt.context
    if (opt.once)
        event.once = opt.once
    if (opt.prepend)
        this._events[name].unshift(event)
    else
        this._events[name].push(event)
    return this
}

function remove_listener(name, listener){
    if (!this._events || !this._events[name])
        return this
    var listeners = this._events[name], events = []
    var is_fn = typeof listener=='function'
    for (var i = 0, length = listeners.length; i<length; i++) {
        if (!listener)
            continue
        if (is_fn && listeners[i].fn!==listener || !is_fn && listeners[i]!==listener)
            events.push(listeners[i])
    }
    // reset the array, or remove it completely if we have no more listeners
    this._events[name] = events.length ? events : null
    return this
}

EventEmitter.prototype.on = function on(name: string, fn: Function, context){
    return add_listener.apply(this, [name, fn, {context}]) }
EventEmitter.prototype.once = function once(name: string, fn: Function, context){
    return add_listener.apply(this, [name, fn, {context, once: true}]) }
EventEmitter.prototype.prependListener = function prependListener(name: string, fn: Function, context){
    return add_listener.apply(this, [name, fn, {context, prepend: true}]) }
EventEmitter.prototype.prependOnceListener = function prependOnceListener(name: string, fn: Function, context){
    return this.prependListener(name, fn, {context, prepend: true, once: true}) }
EventEmitter.prototype.removeListener = function removeListener(name: string, fn: Function){
    return remove_listener.apply(this, [name, fn]) }
EventEmitter.prototype.removeAllListeners = function removeAllListeners(name: string){
    if (!this._events)
        return this
    if (name)
        this._events[name] = null
    else
        this._events = {}
    return this
}

// alias methods names because people roll like that
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;
EventEmitter.prototype.eventNames = function eventNames(){
    return Object.keys(this._events).filter(e=>this._events[e]!==null) }

EventEmitter.EventEmitter = EventEmitter
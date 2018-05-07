import Queue from '../classes/Queue.class';

export const isNew = data => !data.id;
export const getURL = (url, id, emulateIdKey) => emulateIdKey ? url : (url + (isDef(id) ? `/${id}` : ''));
export const isDef = val => typeof val !== 'undefined';
export const defaults = (obj, defaults = {}) =>{
    const merge = (defaults, obj) => defaults.constructor === Array ? defaults.concat(obj) : Object.assign(defaults, obj);
    return isDef(obj) ? merge(defaults, obj) : defaults;
};

/**
 * format code like that:
 * ```
 * {
 *   "id": { type: Number, default: null },
 *   "nickname": { type: String, default: "" },
 *   "emial": { type: String, default:"" },
 *   "password": { type: String, default:"" }
 * }
 * ```
 */
export function convert(data, format, opts={}) {
    let { fields } = opts;
    fields = typeof fields === 'undefined' ? [].concat(Object.keys(data), Object.keys(format)) : fields;
    
    const result = {};
    fields.forEach(fieldName => {
        const fieldSet = format[fieldName];
        if (!fieldSet) return result[fieldName] = data[fieldName];
        let fieldVal = data[fieldName];
        if (fieldSet.type === Array){
            return result[fieldName] = fieldVal ? fieldVal : [];
        }
        if (fieldVal === null || fieldVal === undefined) fieldVal = fieldSet.default;
        else fieldVal = fieldSet.type(fieldVal);
        if (result[fieldName] === fieldVal) return;
        result[fieldName] = fieldVal === NaN ? fieldSet.default : fieldVal;
    });
    return result;
}


export const methods = {
    merge: (methodName, method, hooks)=>{
        return function (...args) {
            const befores = hooks.getHooks(methodName + '::before') || [];
            const afters = hooks.getHooks(methodName + '::after') || [];
            return Queue.run([
                ...befores,
                method,
                ...afters,
            ])(args, { scope:this });
        }
    },
    mergeHooks: (methodName, method, befores=[], afters=[])=>{
        return function (...args) {
            return Queue.run([
                ...befores,
                method,
                ...afters,
            ])(args, { scope: this });
        }
    },
    wrapper: (method) => {
        return (ctx, next) => {
            return method
                .apply(ctx.scope, ctx.args)
                .then(data => {
                    ctx.result = data;
                    next();
                });
        }
    }
}

export default {
    isNew,
    getURL,
    isDef,
    defaults,
    convert,
    methods
};
import { existError, isDef, isString } from "./utils/"
import remote from "./remote"
export default function contact(remotes={}){
    let _default = null
    Object.keys(remotes).forEach(remoteName=>{
        remotes[remoteName]=remote(remotes[remoteName])
    })
    _default = Object.values(remotes).shift()

    const has = name=>Object.keys(remotes).indexOf(name) > -1
    const getRemote = name=>{
        existError(isString, new Error(`The name must be String in contact`))(name)
        existError(isDef, new Error(`No '${name}' found in remotes`))(remotes[name])
        return remotes[name]
    }
    const setRemote = (name, remote)=>(remotes[name]=remote)
    const setDefault = name=>_default=getRemote(name)

    const context = {
        has,
        default:name=>!!name?setDefault(name):_default,
        remote: (...args)=>{
            const [name, remote] = args
            if(args.length>1) setRemote(name, remote)
            else if(!name) return _default
            else return getRemote(name)
        }
    }

    return Object.freeze(context)
}
import $ from "jquery";
import {EventEmitter} from 'events'
var El=function(elString){
    let self=this;
    const myEmitter=new EventEmitter();
    /** @type { JQuery } */
    const $el = this.$el = $(elString);
    this.appendTo=function(what){
        $el.appendTo(what);
        return self;
    }
    Object.assign(this,{
        on:(a,b)=>myEmitter.on(a,b),
        off:(a,b)=>myEmitter.off(a,b),
        emit:(a,b)=>myEmitter.emit(a,b),
    });
}

export default El;
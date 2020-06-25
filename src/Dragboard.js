
import $ from "jquery";
const Dragboard=function($el){
    const dragBoard=this;
    const size={
        x:100,
        y:100,
    }
    const offset={
        x:0,
        y:0,
    }
    /**
     * @typedef {{
     *      drag:{
     *          elements:Set<Draggable>,
     *          sx:number,
     *          sy:number,
     *          dx:number,
     *          dy:number,
     *      }
     *      x:number,
     *      y:number,
     *  }} mouse
     **/
    /**
     * @type {mouse}
     */
    const mouse={
        drag:{
            elements:new Set(),
            sx:0,
            sy:0,
            dx:0,
            dy:0,
        },
        x:0,
        y:0,
    }
    const Draggable=function($draggable){
        this.$el=$draggable;
        $draggable.on("mouseenter",(evt)=>{
            $draggable.addClass("hovered");
        });

        $draggable.on("mouseleave",(evt)=>{
            $draggable.removeClass("hovered");
        });
        
        $draggable.on("mousedown",(evt)=>{
            dragBoard.startDragging(this);
        });

        /** @param {mouse} mouse */
        this.onDrag=function(mouse){}
    }
    /** @param {Draggable} draggable */
    this.startDragging=(draggable)=>{
        draggable.$el.addClass("dragging");
        mouse.drag.elements.add(draggable);
    }
    this.stopDragging=()=>{
        dragEndHandler();
    }

    function dragStartHandler(){
        mouse.drag.sx=mouse.x;
        mouse.drag.sy=mouse.y;
    }
    function dragEndHandler(){
        mouse.drag.elements.forEach((el)=>el.$el.removeClass("dragging"));
        mouse.drag.elements.clear();
    }
    function mouseMoveHandler(){
        if(!mouse.drag.elements.size)return;
        mouse.drag.dx=mouse.drag.sx-mouse.x;
        mouse.drag.dy=mouse.drag.sy-mouse.y;
        mouse.drag.elements.forEach((el)=>el.onDrag(mouse));
    }
    $el.on("mousedown",dragStartHandler);
    // $el.on("mouseup",dragEndHandler);
    $(document).mouseup(dragEndHandler);
    $(document).mousemove(function(event) {


        mouse.x = (event.clientX-offset.x)/size.x;
        //in this case we need the vertical center to be x center
        mouse.y = (event.clientY-offset.y)/size.x;

        mouseMoveHandler();
    });
    $(window).on("resize",calculateDomCoords);
    $(window).on("ready",calculateDomCoords);
    function calculateDomCoords(){
        size.x=$(window).width();
        size.y=$(window).height();
        const ffst=$el.offset();
        offset.x=ffst.left;
        offset.y=ffst.top;
        console.log({offset,size});
    }
    calculateDomCoords();
    this.setDraggable=($el)=>{
        $el.addClass("draggable");
        return new Draggable($el);
    }
}
export default Dragboard;
import $ from "jquery";
import El from "./El";
import WaveCircle from "./WaveCircle";
import PlayWave from "./PlayWave";
import Dragboard from "./Dragboard";


/** 
 * @param {JQuery} $path 
 * @param {Dragboard} dragboard 
 */
const DisplayChannelLine=function($path,dragboard){

    function posToAngle(x,y){
        x-=0.5;
        y-=0.5;
        return 180 * Math.atan2(y,x) / Math.PI ;
    }
    this.angle=Math.random()*360;

    const updateSvg=()=>{
        $path.css("transform",`rotate(${this.angle}deg)`);
    }
    const dragHandler=(mouse)=>{
        this.angle=posToAngle(mouse.x,mouse.y);
        updateSvg();
    }
    const draggable=dragboard.setDraggable($path);
    draggable.onDrag=dragHandler;
    updateSvg();
}

/** 
 * Displays the WaveCircle and the "angles" at which these are played
 * it also controls the angles, thus these two things need to be passed
 * @param {WaveCircle} myWave 
 * @param {PlayWave} myPlayer
 **/
const DisplayWave=function(myWave,myPlayer){
    
    El.call(this,`<div class="wave-display-container"></div>`);
    
    const $svgContainer=$(`
        <svg class="wave" viewBox="-50 -50 100 100" xmlns="http://www.w3.org/2000/svg">
            <path
                class="wave"
                M2 1 h1 v1 h1 v1 h-1 v1 h-1 v-1 h-1 v-1 h1 z"></path>
            <path
                class="test-wave"
                d="M2 1 h1 v1 h1 v1 h-1 v1 h-1 v-1 h-1 v-1 h1 z"></path>
            <g fill="none">
                <path
                    class="listenerline left"
                    d="M-50 0 L50 0"
                />
                <path
                    class="listenerline right"
                    d="M-50 0 L50 0"
                />
                
            </g>
        </svg>`
    );

    
        
    const $path=$svgContainer.find("path.wave");
    const $path2=$svgContainer.find("path.test-wave");
    const $linegroup=$svgContainer.find("g");
    const dragboard=new Dragboard(this.$el);

    const listenerLines=[
        new DisplayChannelLine($linegroup.find(".left"),dragboard),
        new DisplayChannelLine($linegroup.find(".right"),dragboard),
    ];

    $svgContainer.appendTo(this.$el);


    /**
     * get an svg path from array
     * @param {number[]} array
     * @returns {string} svg path atr
     */
    function polarWavePath(array){
        //svg is resizable, so let's think percentually
        let svgWidth=100;
        let svgHeight=100;

        //maximum wave points to draw
        const steps=900;
        //length of the audio segment to draw
        let length=array.length;
        //how many samples to skip on each drawing point
        let stepsPerValue=length/steps;
        //how big to draw the wave, in pixels
        let waveRangePx=svgWidth/20;
        //center of the circle
        const centerx=0;
        const centery=0;
        //radius of the circle. The wave is drawn around it
        const circleRadius = 25;
        //precalculation 
        const twoPi=Math.PI*2
        //the string that makes the drawing
        let svgString="";
        //within the array, get the average level from start to end
        function getRep(start,end){
            let total=0;
            let fac=1/(end-start);
            // array.slice(start,end).map((val)=>total+=Math.sqrt(val*val));
            // total*=fac;
            array.slice(start,end).map((val)=>{
                const tv=Math.abs(val)
                if(tv>total)total=val;
            });
            return total;
        }
        for(let x=0; x<steps; x+=1){
            //index in the audio array
            let index=Math.floor(x*stepsPerValue)
            //wave voltage level, cartesian
            let y=0;
            //for "out from center"
            // let waveOffset= 2* waveRangePx;
            //for "around center"
            let waveOffset=-waveRangePx/2;

            if(stepsPerValue>1){
                y=getRep(index,Math.floor(index+stepsPerValue))*waveRangePx+waveOffset;
            }else{
                y=array[index]*waveRangePx+waveOffset;
            }
            //precalculation
            let sineIndex = twoPi * x /steps;
            //cartesian to polar
            let polarx=Math.cos(sineIndex) * (y+circleRadius);
            let polary=Math.sin(sineIndex) * (y+circleRadius) ;
            //parse the string and add
            if(x==0){
                svgString+=`M${polarx },${polary }`;
            }else{
                svgString+=`\nL${polarx },${polary }`;
            }
        }
        //indicate shape should be closed
        svgString+=`\nZ`;

        return svgString;
    }

    /**
     * get an svg path from array
     * @param {number[]} array
     * @returns {string} svg path atr
     */
    function cartesianWavePath(array){
        //svg is resizable, so let's think percentually
        let svgWidth=100;
        let svgHeight=100;

        //maximum wave points to draw
        const steps=900;
        //length of the audio segment to draw
        let length=array.length;
        //how many samples to skip on each drawing point
        let stepsPerValue=length/steps;
        //the string that makes the drawing
        let svgString="";
        //within the array, get the average level from start to end
        function getRep(start,end){
            let total=0;
            let fac=1/(end-start);
            // array.slice(start,end).map((val)=>total+=Math.sqrt(val*val));
            // total*=fac;
            array.slice(start,end).map((val)=>{
                const tv=Math.abs(val)
                if(tv>total)total=val;
            });
            return total;
        }
        const xSize=0.5*svgWidth/array.length;
        const xStart=-svgWidth/2;
        const ySize=svgHeight/4;
        const yStart=svgWidth/2 ;

        for(let x=0; x<steps; x+=1){
            //index in the audio array
            let index=Math.floor(x*stepsPerValue)
            //wave voltage level, cartesian
            let y=0;

            if(stepsPerValue>1){
                y=getRep(index,Math.floor(index+stepsPerValue));
            }else{
                y=array[index];
            }
            let str=`${x*xSize+xStart},${y*ySize+yStart}`;
            //parse the string and add
            if(x==0){
                svgString+=`M${str}`;
            }else{
                svgString+=`\nL${str}`;
            }
        }
        return svgString;
    }
    function updateWave(){
        $path.attr("d",
            polarWavePath(
                myWave.getArray(0)
            )
        );
        console.log(listenerLines[0].angle);
        $path2.attr("d",
            cartesianWavePath(
                myWave.getArray(
                    listenerLines[0].angle
                )
            )
        );
    }
    setInterval(updateWave,500);
}
export default DisplayWave;
import $ from "jquery";
import El from "./El";
import WaveCircle from "./WaveCircle";
import PlayWave from "./PlayWave";
import Dragboard from "./Dragboard";
import { arrayPolarToCartesian, arrayAsPolar } from "./soundTrigo";
import { arrayResample } from "./arrayResample";


/** 
 * @param {JQuery} $path 
 * @param {Dragboard} dragboard 
 */
const DisplayChannelLine=function($path,dragboard){

    function posToAngle(x,y){
        x-=0.5;
        y-=0.5;
        return 180 * Math.atan2(y,x) / Math.PI - 90;
    }
    this.angle=Math.random()*360;

    const updateSvg=()=>{
        $path.css("transform",`rotate(${this.angle + 90}deg)`);
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
                class="reference"
                M2 1 h1 v1 h1 v1 h-1 v1 h-1 v-1 h-1 v-1 h1 z"></path>
            <path
                class="test-wave left"
                d="M2 1 h1 v1 h1 v1 h-1 v1 h-1 v-1 h-1 v-1 h1 z"></path>
            <path
                class="test-wave right"
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
    const $reference=$svgContainer.find("path.reference");
    const $pathLeft=$svgContainer.find("path.test-wave.left");
    const $pathRight=$svgContainer.find("path.test-wave.right");
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
        let shorterArray=arrayResample(array,900);

        let coords=arrayPolarToCartesian(
            arrayAsPolar(array),
            1
        );
        
        //svg is resizable, so let's think percentually
        let svgWidth=100;
        let svgHeight=100;
        const sizeFactor = 25;
        let svgString="";
        

        coords.map(({x,y},index)=>{
            if(isNaN(x)) x=0;
            if(isNaN(y)) y=0;
            //parse the string and add
            if(index==0){
                svgString+=`M${x*sizeFactor },${y*sizeFactor }`;
            }else{
                svgString+=`\nL${x*sizeFactor },${y*sizeFactor }`;
            }
        });

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
        const xSize=svgWidth/steps;
        const xStart=-svgWidth/2;
        const ySize=svgHeight/8;
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
        $pathLeft.attr("d",
            cartesianWavePath(
                myWave.getTransformedArray(
                    listenerLines[0].angle
                )
            )
        );
        $pathRight.attr("d",
            cartesianWavePath(
                myWave.getTransformedArray(
                    listenerLines[1].angle
                )
            )
        );
    }
    setInterval(updateWave,90);

    $reference.attr("d",
            polarWavePath(
                new Array(100).fill(0)
            )
        );
}
export default DisplayWave;
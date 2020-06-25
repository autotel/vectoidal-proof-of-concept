import $ from "jquery";
import El from "./El";
import WaveCircle from "./WaveCircle";
import PlayWave from "./PlayWave";
import Dragboard from "./Dragboard";
import { arrayPolarToCartesian, arrayAsPolar, arrayClipValues } from "./soundTrigo";
import { arrayResample } from "./arrayResample";
import { transformOffset } from "./transformOffset";
const levelToSvg=50;

/** 
 * @param {JQuery} $path 
 * @param {Dragboard} dragboard 
 * @param {PlayWave} player 
 * @param {{value:number}} angleItem 
 */
const DisplayChannelLine=function($path,dragboard,player,angleItem){
    
    function posToAngle(x,y){
        x-=0.5;
        y-=0.5;
        return 180 * Math.atan2(y,x) / Math.PI - 90;
    }

    const updateSvg=()=>{
        $path.css("transform",`rotate(${angleItem.value + 90}deg)`);
    }
    const dragHandler=(mouse)=>{
        angleItem.value=posToAngle(mouse.x,mouse.y);
        player.updateSound();
        updateSvg();
    }
    const draggable=dragboard.setDraggable($path);
    draggable.onDrag=dragHandler;
    updateSvg();
}
/** 
 * @param {JQuery} $el 
 * @param {Dragboard} dragboard
 * @param {PlayWave} player 
 * @param {WaveCircle} wave 
 */
const DisplayOffsetReference=function($el,dragboard,player,wave){
    
    const $circle=$el.find(".reference");
    const $wave=$el.find(".wave");
    const svgToLevel=100/levelToSvg;
    function posToValue(x,y){
        x-=0.5;
        y-=0.5;
        return Math.sqrt(x*x+y*y)*svgToLevel;
    }
    
    const updateSvg=()=>{
        $circle.attr("r",`${transformOffset.value*levelToSvg}`);
    }
    const dragHandler=(mouse)=>{
        transformOffset.value=posToValue(mouse.x,mouse.y);
        wave.clearCache();
        player.updateSound();
        updateSvg();
    }
    const draggable=dragboard.setDraggable($circle);
    $wave.on("mousedown",()=>dragboard.startDragging(draggable));
    $wave.on("mouseup",()=>dragboard.stopDragging());
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
            <circle
                class="reference"
                cx="0" cy="0" r="10" 
                ></circle>
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
    const $reference=$svgContainer.find("circle.reference");
    const $pathLeft=$svgContainer.find("path.test-wave.left");
    const $pathRight=$svgContainer.find("path.test-wave.right");
    const $linegroup=$svgContainer.find("g");
    const dragboard=new Dragboard(this.$el);

    const chanames = ["left","right"];
    const listenerLines=[];
    myPlayer.angles.map((angleItem,index)=>{
        listenerLines.push(
            new DisplayChannelLine(
                $linegroup.find("."+chanames[index]),
                dragboard,myPlayer,
                angleItem
            ),
        )
    });

    const referenceCircle=new DisplayOffsetReference(
        $svgContainer,dragboard,myPlayer,myWave
    );

    $svgContainer.appendTo(this.$el);


    /**
     * get an svg path from array
     * @param {number[]} array
     * @returns {string} svg path atr
     */
    function polarWavePath(array){
        let shorterArray=arrayResample(array,200);
        shorterArray=arrayClipValues(shorterArray);

        let coords=arrayPolarToCartesian(
            arrayAsPolar(shorterArray),
            transformOffset.value
        );
        const sizeFactor = levelToSvg;
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
     * TODO: simplyfy using the new soundTrigo functions
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
                myPlayer.angles[0].audioArray
            )
        );
        $pathRight.attr("d",
            cartesianWavePath(
                myPlayer.angles[1].audioArray
            )
        );
    }
    setInterval(updateWave,90);

}
export default DisplayWave;
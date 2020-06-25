import getAudioContext from "./getAudioContext";
import { arraySquashPolarAxis, twoPi, arrayAsPolar, arrayClipValues } from "./soundTrigo";
import { transformOffset } from "./transformOffset";

const audioContext=getAudioContext();
const maxCache=4;

/**
 * container for an array of samples 
 * it can return these samples from an "angle"
 * as audio or numbers
 **/
const WaveCircle=function(){
    /** @type {number[]} source of truth for the audio contents */
    let myAudioArray=[];
    const sampleRate=audioContext.sampleRate;

    //fill array with test sine
    let l = 900;
    for(let a=0; a<l; a++){
        // myAudioArray[a]=Math.sin(Math.PI*2*a/l) + Math.sin(Math.PI*16*a/l)*0.3 + Math.random()*0.03;
        // myAudioArray[a]=(a%200)/200>0.5?-1:1;
        // myAudioArray[a]=(a%450)/450-0.5;
        myAudioArray[a]=(a%450)/450-0.5 + Math.sin(Math.PI*4*a/l);
        // myAudioArray[a]=Math.sin(Math.PI*2*a/l);

    }

    /**
     * @param {number?} angle
     */
    function angleToSampleNumber(angle){
        let twoPiRadAngle=angle/360;
        return Math.floor(twoPiRadAngle*myAudioArray.length);

    }
    /**
     * get array starting at the indicated start point, 
     * and ending in start-1. Contents are appended in a
     * round buffer fashion
     */
    function getArrayAround(start){
        let partA=myAudioArray.slice(0,start);
        let partB=myAudioArray.slice(start,myAudioArray.length);
        return partB.concat(partA);
    }
    /**
     * Get the contained values as number array
     * @param {number?} angle
     * @returns {number[]} the values
     * */
    this.getArray=(angle)=>{
        const ret=getArrayAround(
            angleToSampleNumber(angle)
        );
        return ret;
    }

    /** @type {{angle:number,result:number[]}[]} */
    const cache=[];

    /**
     * Store a transformed array, in case it
     * is requested again with the same angle
     * which is the most common case
     * if is cached, it returns that copy
     * if not, it returns false;
     * @param refAngle
     * @returns {number[]|false}
     */
    const isCached=(refAngle)=>{
        for(let a=0; a<cache.length; a++){
            let {angle,result} = cache[a];
            if(angle===refAngle) return result;
        }
        return false;
    }
    
    /** 
     * @param {number} angle 
     * @param {number[]} result 
     **/
    const storeCache=(angle,result)=>{
        cache.push({angle,result});
        if(cache.length>maxCache) cache.shift();
    }
    /** this has to be called for any change done to
     * the wave or it's form of transformation */
    this.clearCache=()=>{
        cache.splice(0);
    }

    /**
     * Get the contained values as number array
     * with line transform:
     * a line is projected from 0,0 as center
     * and then the distance to that line is
     * projected for each sample. That is the
     * return result.
     * 
     * This is the best candidate for webassembly
     * @param {number?} angle
     * @returns {number[]} the values
     * */
    this.getTransformedArray=(angle)=>{
        const cached=isCached(angle);
        if(cached) return cached;
        console.log("regenerating",angle);
        const ret = arrayClipValues(
            arraySquashPolarAxis(
                arrayAsPolar(
                    getArrayAround( // squash assumes angle 0, so rotation is added by offsetting array
                        angleToSampleNumber(angle) 
                    )
                ),
                transformOffset.value
            ).map(({th,r})=>isNaN(r)?0:r) //map back to sample format. Since r is distance, we need to offset it back around 0
        );
        storeCache(angle,ret);
        return ret;
    }
}
export default WaveCircle;
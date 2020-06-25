import getAudioContext from "./getAudioContext";

const audioContext=getAudioContext();
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
    let l = 200;
    for(let a=0; a<l; a++){
        myAudioArray[a]=Math.sin(Math.PI*4*a/l) + Math.random()*0.2;
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
    /** 
     * Get the contained values as audio
     * idk yet what format, but a convenient one I promise
     * you get one channel per provided angle
     * @param {number[]} angles
     */
    this.getAudio=(angles)=>{
        //convert to convenient audio format
        const ret = new AudioBuffer({
            length: myAudioArray.length,
            sampleRate: sampleRate,
            numberOfChannels: angles.length,
        });

        for(let channelNumber = 0; channelNumber<angles.length; channelNumber++){
            const chanArr=this.getArray(angles[channelNumber]);
            const nowBuffering = ret.getChannelData(channelNumber);
            for (
                var sampleNumber = 0;
                sampleNumber < chanArr.length;
                sampleNumber++
            ) {
                nowBuffering[sampleNumber] = chanArr[sampleNumber];
            }
        
        }
        return ret;
    }
}
export default WaveCircle;
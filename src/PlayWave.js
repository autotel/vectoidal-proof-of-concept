import WaveCircle from "./WaveCircle";
import getAudioContext from "./getAudioContext";


const audioContext=getAudioContext();

/**
 * player for a wave circle
 * it gets it's samples from  a WaveCircle.
 * 
 * One is needed, because it contains the two stereo channels, in order
 * to ensure they are in sync
 * 
 * How to prevent stutter while rotating? it'd be nice being able
 * to lfo the angle, for example.
 * Changing the pitch of the playback can be used to transition angle, 
 * it would also be beneficial in the sense that rebuilding the wave is
 * not necessary. It is a bit harder to calculate and the hierarchical 
 * logic is different. In this case the playWave would be the source for 
 * the angle where the DisplayWave merely sets a "target" angle
 * 
 * The other option is some sort of interpolation of the samples themselves
 * I have done such a thing in one previous failed experiment, the simpler
 * version of graphic score granular autotel web toy. A bit heavy, though.
 * 
 * For now better not to think too much about it
 * 
 * @param {WaveCircle} myWave 
*/

const PlayWave=function(myWave){
    /**
     * @type {AudioBufferSourceNode|false}
     */
    var source=false;
    const myGain = audioContext.createGain();
    myGain.gain.value=0.1;
    myGain.connect(audioContext.destination);

    this.angles=[
        {
            value:90,
            audioArray:[]
        },
        {
            value:0,
            audioArray:[]
        },
    ];
    //convert the current cache of angles to an AudioBuffer
    const getAudio=()=>{
        const ret = new AudioBuffer({
            length: this.angles[0].audioArray.length,
            sampleRate: audioContext.sampleRate,
            numberOfChannels: this.angles.length,
        });

        for(
            let channelNumber = 0;
            channelNumber<this.angles.length;
            channelNumber++
        ){
            const chanArr=this.angles[channelNumber].audioArray;
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
    //TODO: interpolate the resulting array
    this.updateSound=()=>{

        this.angles.map((angleItem)=>{
            angleItem.audioArray = myWave.getTransformedArray(
                angleItem.value
            )
        });
        
        
        if(source){
            try{
                source.disconnect();
                source.stop();
            }catch(e){}
        }
        const buffer=getAudio();
        source = new AudioBufferSourceNode(audioContext, {buffer});
        if(!source) throw new Error("failed to make source");
        
        source.connect(myGain);
        source.loop = true;
        source.start(0);

    }
    this.updateSound();
    
}
export default PlayWave;
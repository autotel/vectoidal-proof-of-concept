
/**
 * @returns {AudioContext} the new or existing context
 */
function getAudioContext(){
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    
    if(! window.audioCtx){
        console.log("creating new audioContext", AudioContext);
        window.audioCtx = new AudioContext();
        // var oscillator = audioCtx.createOscillator();
        // var gain = audioCtx.createGain();
        // gain.gain.value=0.2;
        // gain.connect(audioCtx.destination);
        // oscillator.type = 'square';
        // oscillator.frequency.setValueAtTime(220, audioCtx.currentTime); // value in hertz
        // oscillator.connect(gain);
        // oscillator.start();
    }
    return window.audioCtx;
}

export default getAudioContext;
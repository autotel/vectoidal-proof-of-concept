/**
 * Force an array to have a certain length
 * if original is larger, it averages items
 * if original shorter, it adds items 
 * todo: make interpolation for the shorter case too
 * @param {number[]} array,
 * @param {number} targetLength
 * @returns {number[]} 
 */

export const arrayResample=(array,targetLength)=>{
    const steps=targetLength;

    //how many samples to skip on each drawing point
    let stepsPerValue=length/steps;

    //within the array, get the average level from start to end
    function getAverage(start,end){
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
    /** @type  {number[]}  */
    const ret=[];

    for(let x=0; x<steps; x+=1){
        //index in the audio array
        let index=Math.floor(x*stepsPerValue)
        
        if(stepsPerValue>1){
            ret.push(getAverage(index,Math.floor(index+stepsPerValue)));
        }else{
            ret.push(array[index]);
        }
    }

    return ret;

};
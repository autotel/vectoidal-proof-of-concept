
export const twoPi=2*Math.PI;
export const hypoth=Math.sqrt(2);

/**
 * make an array of numbers become a polar array
 * without any transformation. In other words
 * take a sound channel and make it so it can be
 * fed into polarToCartesian
 * @param {number[]} arr
 * @returns {{th:number,r:number}[]}
 */
export const arrayAsPolar=(arr)=>arr.map((sample,sampleNumber,array)=>{
    
    return {
        th:twoPi * sampleNumber/array.length,
        r:sample,
    }
});

/**
 * convert an array of x,y into th,r coords around 0,0
 * @param {{x:number,y:number}[]} arr
 * @param {number?} dcOffset
 * @returns {{th:number,r:number}[]}
 * 
 */
export const arrayCartesianToPolar=(arr,dcOffset=0)=>{
    return arr.map(({x,y})=>{
        return{

            /** 
             * because we need the negative numbers.
             * Maybe there is a more precise way? 
             * It works at least
             **/
            r:(x+y)*hypoth-dcOffset,
            th:Math.atan2(y,x)
        }
    });
};

/**
 * convert an array of th,r into x,y coords around 0,0
 * @param {{th:number,r:number}[]} arr
 * @param {number?} dcOffset
 * @returns {{x:number,y:number}[]} 
 */
export const arrayPolarToCartesian=(arr,dcOffset=0)=>{
    return arr.map(({th,r})=>{
        const rpdc=r+dcOffset;
        return {
            x:Math.cos(th)*rpdc,
            y:Math.sin(th)*rpdc
        }
    });
}

/**
 * convert an array of th,r into x,y coords around 0,0. 
 * X is not calculated and set to 0
 * @param {{th:number,r:number}[]} arr
 * @param {number?} dcOffset
 * @returns {{x:0,y:number}[]} 
 */
export const arrayPolarToCartesianAndSquashX=(arr,dcOffset=0)=>{
    return arr.map(({th,r})=>{
        return {
            x:0,
            y:Math.sin(th)*(r+dcOffset)
        }
    });
}

/**
 * takes polar coordinates array, maps them
 * in a cartesian space around 0,0, sets all
 * x to zero in the cartesian space and converts
 * back to polar array.
 * @param {{th:number,r:number}[]} arr
 * @param {number?} dcOffset
 * @returns {{th:number,r:number}[]} 
 */
export const arraySquashPolarAxis=(arr,dcOffset=0)=>{
    return arrayCartesianToPolar(
        arrayPolarToCartesianAndSquashX(arr,dcOffset)
    );
}
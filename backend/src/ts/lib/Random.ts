export class Random {

    /**
     * 
     * @param min 
     * @param max 
     * @returns a random integer between min and max (inclusive)
     */
    static randomInteger(min: number, max: number): number {
        if (min == null || max == null) throw new Error("minimum or maximum must not be null");
        if (min > max) throw new Error("minimum must not be larger than the maximum");
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 
     * @param min 
     * @param max 
     * @returns a random float between min and max (inclusive)
     */
    static randomFloat(min: number, max: number): number {
        if (min == null || max == null) throw new Error("minimum or maximum must not be null");
        if (min > max) throw new Error("minimum must not be larger than the maximum");
        return (Math.random() * (max - min + Number.MIN_VALUE)) + min
    }

    /**
     * 
     * @returns a random boolean
     */
    static randomBoolean(): boolean {
        return this.randomChance(.5);
    }

    /**
     * 
     * @param chance a number in the range [0,1]
     * @returns a boolean
     */
    static randomChance(chance: number): boolean {
        if (chance > 1 || chance < 0) throw new Error(`chance must be in the range [0,1] instead ${chance} was given`)
        return Math.random() <= chance;
    }

    /**
     * 
     * @param arr 
     * @returns a random array index from the input array
     */
    static randomArrayIndexFromArray(arr: Array<any> | readonly any[]): number {
        return this.randomInteger(0, arr.length - 1);
    }

    /**
     * 
     * @param arr 
     * @returns a random element from the array
     */
    static randomElementFromArray<type>(arr: Array<type> | readonly type[]): type {
        return arr[this.randomArrayIndexFromArray(arr)];
    }

    /**
     * 
     * @param weightsArray an array of positive numbers representing weights of each index
     * @returns a weighted random index for the weights array
     */
    static weightedArrayIndexFromArray(weightsArray: number[]): number {
        if (weightsArray.some(x => x < 0)) throw new Error("weights array cannot contain negative numbers");
        const total = weightsArray.reduce((a, b) => a + b, 0);

        const random = Math.random() * total;
        let value = 0;
        for (let i = 0; i < weightsArray.length; i++) {
            value += weightsArray[i];
            if (random < value) return i;
        }

        //should be impossible
        return weightsArray.length-1;
    }
}

export default Random;
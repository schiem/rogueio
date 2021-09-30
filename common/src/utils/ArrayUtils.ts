export const ArrayMax = (arr: number[]): number => {
    let highest = -Infinity;
    for(let i = 0; i < arr.length; i++) {
        if (arr[i] > highest) {
            highest = arr[i];
        }
    }
    return highest;
} 
module.exports.create = (weight, fallOff) => {
    let sum = 0;
    let wsum = 0;
    return {
        update: (bytes, microseconds, trainLen) => {
            const w = Math.pow(trainLen, weight)
            if (fallOff) {
                sum -= sum / fallOff;
                wsum -= wsum / fallOff;
            }
            const bits = bytes * 8;
            // This:    bits * 1000 / microseconds
            // Same as: bits / (microseconds / 1000)
            // Same as: bits / millisecond
            // Same as: kilobits / second
            sum += bits * 1000 / microseconds * w;
            wsum += w;
        },
        getKbps: () => { return sum / wsum; }
    }
};
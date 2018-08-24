const Util = require('../Util.js');

const SQRT_TWO_PI = Math.sqrt(2.0 * Math.PI);

const computeKde = (kbps) => {
    const getBandwidth = (list) => {
        let sumX = 0;
        let sumX2 = 0;
        list.forEach((el) => {
            sumX += el;
            sumX2 += el * el;
        });
        const x  = sumX / list.length;
        const x2 = sumX2 / list.length;
        const sigma = Math.sqrt(x2 - (x * x));
        return sigma * Math.pow((3.0 * list.length / 4.0), (-1.0 / 5.0));
    }; 
    const pdf = (entry, list, bandwidth) => {
        const bwSqrtTwoPi = (bandwidth * SQRT_TWO_PI);
        let d = 0.0;
        for(let i = 0; i < list.length; i++) {
            const z = (entry - list[i]) / bandwidth;
            d += Math.exp(-0.5 * z * z) / bwSqrtTwoPi;
        }
        return d / list.length;
    };

    const bandwidth = getBandwidth(kbps);
    const pdfs = kbps.map((el) => pdf(el, kbps, bandwidth));
    let maxPdf = 0;
    let maxVal = 0;
    pdfs.forEach((p, i) => {
        if (p > maxPdf) { maxPdf = p; maxVal = kbps[i]; }
    });
    return maxVal;
};

module.exports.create = () => {
    let kbpsList = [];
    return {
        update: (bytes, microseconds, trainLen) => {
            kbpsList.push(Util.dataToKbps(bytes, microseconds, trainLen));
        },
        getKbps: () => { return computeKde(kbpsList); }
    }
};
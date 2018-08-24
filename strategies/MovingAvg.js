const Util = require('../Util.js');

module.exports.create = (N) => {
    let ma = 0.0;
    return {
        update: (bytes, microseconds, trainLen) => {
            const kbps = Util.dataToKbps(bytes, microseconds, trainLen);
            ma = ma - ma / N + kbps / N;
        },
        getKbps: () => { return ma; }
    }
};
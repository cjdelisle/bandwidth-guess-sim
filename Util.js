module.exports.dataToKbps = (bytes, microseconds, trainLen) => {
    return bytes * 1000 * 8 / microseconds;
};
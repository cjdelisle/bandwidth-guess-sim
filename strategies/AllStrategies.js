module.exports.create = () => {
    return [
        [ 'WeightedAvg0', require('./WeightedAvg.js').create(0, 1000) ],
        [ 'WeightedAvg1', require('./WeightedAvg.js').create(1, 1000) ],
        [ 'WeightedAvg5', require('./WeightedAvg.js').create(5, 1000) ],
        [ 'WeightedAvg0NoFalloff', require('./WeightedAvg.js').create(0) ],
        [ 'WeightedAvg1NoFalloff', require('./WeightedAvg.js').create(1) ],
        [ 'WeightedAvg5NoFalloff', require('./WeightedAvg.js').create(5) ],

        [ 'MovingAvg64', require('./MovingAvg.js').create(64) ],
        [ 'MovingAvg128', require('./MovingAvg.js').create(128) ],
        [ 'MovingAvg256', require('./MovingAvg.js').create(256) ],
        [ 'MovingAvg512', require('./MovingAvg.js').create(512) ],
        [ 'MovingAvg1024', require('./MovingAvg.js').create(1024) ],

        [ 'KernelDensityPDF', require('./KernelDensityPDF.js').create() ]
    ];
};
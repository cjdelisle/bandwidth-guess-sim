const Fs = require('fs');

const nThen = require('nthen');
const AllStrategies = require('./strategies/AllStrategies.js');

const parseFile = (data) => {
    return data.split('\n').filter((x)=>x).map((x)=> {
        return x.split(' ').map(Number);
    });
};

const print = (name, val, error) => {
    console.log(
        name + new Array(30-name.length).fill().join(' ') +
        Math.floor(val) + ' kbps ' +
        error + '% error'
    );
};

const main = () => {
    const strategies = AllStrategies.create();
    const strategyError = [];
    let files;
    nThen((w) => {
        Fs.readdir('./data', w((err, f) => {
            if (err) { throw err; }
            files = f;
        }));
    }).nThen((w) => {
        let nt = nThen;
        files.forEach((f) => {
            const speed = Number(f.replace(/.*\.([0-9]+)kbps\.txt$/, (all, x) => x));
            if (isNaN(speed)) { throw new Error("Malformed filename " + f); }
            nt = nt((w) => {
                Fs.readFile('./data/' + f, 'utf8', w((err, ret) => {
                    if (err) { throw err; }
                    const data = parseFile(ret);
                    console.log('--- ' + f + ' ---');
                    let totalTime = 0;
                    let totalSize = 0;
                    for (let i = 0; i < data.length; i++) {
                        const di = data[i];
                        if (di[2] === 1) {
                            totalSize = 0;
                            totalTime = 0;
                        }
                        totalSize += di[0];
                        totalTime += di[1]/1000;
                        for (let j = 0; j < strategies.length; j++) {
                            strategies[j][1].update(totalSize, totalTime, di[2]);
                        }
                    }
                    strategies.forEach((s, i) => {
                        const observedSpeed = s[1].getKbps();
                        const error = Math.floor(Math.abs(observedSpeed - speed) / Math.min(speed, observedSpeed) * 100);
                        (strategyError[i] = strategyError[i] || []).push(error);
                        print(s[0], observedSpeed, error);
                    });
                    console.log();
                }));
            }).nThen;
        });
        nt(w());
    }).nThen((w) => {
        console.log('--- AVERAGE ERROR ---');
        strategies.forEach((s, i) => {
            let errorSum = 0;
            strategyError[i].forEach((se) => { errorSum += se; });
            console.log(
                s[0] + new Array(30-s[0].length).fill().join(' ') +
                Math.floor(errorSum / strategyError[i].length) + '% error'
            );
        });
    })
};
main();
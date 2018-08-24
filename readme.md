# Bandwidth Measurement Experiments

This repo contains a testing dataset of packet timings extracted from cjdns under different conditions
and a set of different strategies. The goal of the strategies is to try to estimate the line speed of
the link from the timings and sizes of incoming packets.

## See it work

Requires nodejs and npm

```
npm install
node ./estimate.js
```

## Data format

The filenames of the data files are `<name>.<bandwidth>kbps.txt`, the bandwidth in the filename is
used to calculate the error rate of different bandwidth calculation strategies.

The data files contain space deliniated tuples with `bytes nanosecond-timediff trainlength`, bytes
is the number of bytes in the currently received packet, *nanosecond-timediff* is the number of nanoseconds
since the last packet was received and *trainlength* is the number of packets from the same peer which have
been received in sequence.

## Theory of bandwidth measurement

In theory, one should be able to measure bandwidth by looking at the time-gap between packets which were
sent at the same time. This is because when the packets encounter a bottleneck in the line, they are
buffered at the beginning of the bottleneck and then fed a little at a time through that bottleneck.
When they arrive on the other side, they are received into a buffer and then sent on at the time that
each one finishes being received, thus creating gaps between packets.

This is implementing
[Receiver Only Packet Pair](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.163.4899&rep=rep1&type=pdf)
bandwidth measurement. The datasets in this project are collected from cjdns with modifications to log
timestamps on incoming packets.

### Key problems

There are a few problems with Receiver Only Packet Pair:

* You don't know whether any given pair of packets were sent at the same time, if they were actually
sent some time apart, you might detect a gap between packets which in fact has nothing to do with the
line speed.
* A packet (say, destine for another host) can slip between the two packets which you're measuring the
gap between, if this happens before the bottleneck, it will delay the second packet, widening the gap.
* There is no guarantee that you will be notified exactly when the packet arrives, device drivers such
as [NAPI](https://wiki.linuxfoundation.org/networking/napi) are designed to batch incoming messages,
they may be further batched inside of the kernel, before waking up your application, so the gap can
be compressed as you receive a batch of packets, essentially all at once.

## How to collect more data

Using a recent version of cjdns (crashey branch as of the time of this writing), first you'll have to
enable timestamping:

```
$ cjdnstool cexec InterfaceController_timestampPackets --enable=1
```

This is because the high resolution timestamp triggers an extra system call per-packet so it is off
by default. Secondly, you extract the data using the cjdns logging infrastructure:

```
$ cjdnstool log -f InterfaceController.c | sed -n -e 's/.*RECV TIME //p' | tee ./my_capture.txt
```

Once you have a capture, rename it to `<some name>.<bandwidth>kbps.txt` and place it in `/data` and
it will automatically be examined.

## Details of the implementation

* When the *trainlength* is greater than 1, the size and time diff provided to the algorithm will be
that of the entire packet train, not just the gap between the two packets.
* Error percentage for the output is calculated using the *smaller* of the real number and the
expected number, in order to avoid giving low-ball results an unfair advantage.

## Results of running the simulation:

```
$ node ./estimate.js
--- fiber-idle.24000kbps.txt ---
WeightedAvg0                 10776 kbps 122% error
WeightedAvg1                 18278 kbps 31% error
WeightedAvg5                 27078 kbps 12% error
WeightedAvg0NoFalloff        17354 kbps 38% error
WeightedAvg1NoFalloff        35732 kbps 48% error
WeightedAvg5NoFalloff        43513 kbps 81% error
MovingAvg64                  7838 kbps 206% error
MovingAvg128                 8890 kbps 169% error
MovingAvg256                 9855 kbps 143% error
MovingAvg512                 10031 kbps 139% error
MovingAvg1024                10665 kbps 125% error
KernelDensityPDF             815 kbps 2841% error

--- fiber-speedtest.24000kbps.txt ---
WeightedAvg0                 14131 kbps 69% error
WeightedAvg1                 10072 kbps 138% error
WeightedAvg5                 30526 kbps 27% error
WeightedAvg0NoFalloff        41413 kbps 72% error
WeightedAvg1NoFalloff        37371 kbps 55% error
WeightedAvg5NoFalloff        25515 kbps 6% error
MovingAvg64                  9246 kbps 159% error
MovingAvg128                 9885 kbps 142% error
MovingAvg256                 11540 kbps 107% error
MovingAvg512                 13104 kbps 83% error
MovingAvg1024                14177 kbps 69% error
KernelDensityPDF             27565 kbps 14% error

--- phone-idle.3176kbps.txt ---
WeightedAvg0                 13635 kbps 329% error
WeightedAvg1                 10600 kbps 233% error
WeightedAvg5                 30526 kbps 861% error
WeightedAvg0NoFalloff        40916 kbps 1188% error
WeightedAvg1NoFalloff        37360 kbps 1076% error
WeightedAvg5NoFalloff        25515 kbps 703% error
MovingAvg64                  15176 kbps 377% error
MovingAvg128                 12159 kbps 282% error
MovingAvg256                 11876 kbps 273% error
MovingAvg512                 12733 kbps 300% error
MovingAvg1024                13672 kbps 330% error
KernelDensityPDF             27594 kbps 768% error

--- phone-speedtest.3176kbps.txt ---
WeightedAvg0                 18994 kbps 498% error
WeightedAvg1                 7296 kbps 129% error
WeightedAvg5                 5812 kbps 83% error
WeightedAvg0NoFalloff        39102 kbps 1131% error
WeightedAvg1NoFalloff        35373 kbps 1013% error
WeightedAvg5NoFalloff        25448 kbps 701% error
MovingAvg64                  17500 kbps 451% error
MovingAvg128                 21577 kbps 579% error
MovingAvg256                 19995 kbps 529% error
MovingAvg512                 17904 kbps 463% error
MovingAvg1024                19090 kbps 501% error
KernelDensityPDF             5085 kbps 60% error

--- AVERAGE ERROR ---
WeightedAvg0                 254% error
WeightedAvg1                 132% error
WeightedAvg5                 245% error
WeightedAvg0NoFalloff        607% error
WeightedAvg1NoFalloff        548% error
WeightedAvg5NoFalloff        372% error
MovingAvg64                  298% error
MovingAvg128                 293% error
MovingAvg256                 263% error
MovingAvg512                 246% error
MovingAvg1024                256% error
KernelDensityPDF             920% error
```
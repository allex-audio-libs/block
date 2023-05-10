var pi = Math.atan(1)*4;

function fakeGenerator (clockinput) {
    var rand = Math.random(); // in the [0, 1) range
    //return rand*2 /*in the [0, 2) range*/ -1 ; //in the [-1, 1) range
    return Math.sin(clockinput*440*2*pi);
}

function ourSampleProducer (clockinput) {
    var output = fakeGenerator(clockinput); //in the [-1, 1] range
    Speaker.onChannel1Input(output);
}

describe('Test Speaker', function () {
    it('Load Lib', function () {
        return setGlobal('Lib', require('..')(execlib)); //Lib will export only the EventLite class
    });
    it('See Lib', function () {
        console.log('Lib', Lib);
    });
    it('Create Clock', function () {
        return setGlobal('Clock', new Lib.Clock());
    });
    it('Create Speaker', function () {
        return setGlobal('Speaker', new Lib.Speaker());
    });
    it('Listen to clock and Wait', function () {
        this.timeout(1e7);
        Clock.setSampleRate(44100);
        Speaker.setChannels(1);
        Speaker.onSampleRateInput(Clock.sampleRate); //shortcut in low-level test
        Clock.hasClockOutput.attach(ourSampleProducer);
        return lib.q.delay(5000, true);
    });
    it ('Kill Clock', function () {
        Clock.destroy();
        Speaker.destroy();
    });
});
function destructBlock (block) {
    var as=block.attachments;
    block.destroy();
    expect(as.length).to.equal(0);
}

describe('Test Complex Sine', function () {
    it('Load Lib', function () {
        return setGlobal('Lib', require('..')(execlib)); //Lib will export only the EventLite class
    });
    it('See Lib', function () {
        console.log('Lib', Lib);
    });
    it('Create Clock', function () {
        return setGlobal('Clock', new Lib.Clock());
    });
    it('Create Sine Generator', function () {
        return setGlobal('Sine', new Lib.SineGenerator());
    });
    it('Create Slow Sine Generator', function () {
        return setGlobal('SlowSine', new Lib.SineGenerator());
    });
    it('Set Slow Sine Generator', function () {
        SlowSine.setFrequencyHz(1440);
    });
    it('Create Speaker', function () {
        return setGlobal('Speaker', new Lib.Speaker());
    });
    it('Connect\'em all', function () {
        Clock.setSampleRate(44100);
        SlowSine.setVolume(1e-8);
        SlowSine.attachToPreviousBlock(Clock, 'Clock', 'Clock');
        Sine.attachToPreviousBlock(Clock, 'Clock', 'Clock');
        Sine.attachToPreviousBlock(SlowSine, 'Samples', 'FrequencyHzModulation');
        //Sine.attachToPreviousBlock(SlowSine, 'Samples', 'Volume');
        Speaker.attachToPreviousBlock(Clock, 'SampleRate', 'SampleRate');
        Speaker.attachToPreviousBlock(Sine, 'Samples', 'Samples');
    });
    it('Wait', function () {
        this.timeout(1e7);
        return lib.q.delay(5000, true);
    });
    it('Disconnect\'em all', function () {
        SlowSine.detachFromPreviousBlock(Clock, 'Clock', 'Clock');
        Sine.detachFromPreviousBlock(Clock, 'Clock', 'Clock');
        Sine.detachFromPreviousBlock(SlowSine, 'Samples', 'FrequencyHzModulation');
        expect(Sine.attachments.length).to.equal(0);
        expect(Clock.hasClockOutput.listeners.length).to.equal(0);
        Speaker.detachFromPreviousBlock(Sine, 'Samples', 'Samples');
        Speaker.detachFromPreviousBlock(Clock, 'SampleRate', 'SampleRate');
        expect(Speaker.attachments.length).to.equal(0);
        expect(Sine.hasSamplesOutput.listeners.length).to.equal(0);
    });
    it ('Kill Clock', function () {
        destructBlock(Clock);
        destructBlock(Sine);
        destructBlock(Speaker);
    });
});
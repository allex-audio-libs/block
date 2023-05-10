function destructBlock (block) {
    var as=block.attachments;
    block.destroy();
    expect(as.length).to.equal(0);
}

describe('Test Sine', function () {
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
    it('Create Speaker', function () {
        return setGlobal('Speaker', new Lib.Speaker());
    });
    it('Connect\'em all', function () {
        Clock.setSampleRate(44100);        
        Sine.attachToPreviousBlock(Clock, 'Clock', 'Clock');
        Speaker.attachToPreviousBlock(Clock, 'SampleRate', 'SampleRate');
        Speaker.attachToPreviousBlock(Sine, 'Samples', 'Channel1');
    });
    it('Wait', function () {
        this.timeout(1e7);
        return lib.q.delay(5000, true);
    });
    it('Disconnect\'em all', function () {
        Sine.detachFromPreviousBlock(Clock, 'Clock', 'Clock');
        expect(Sine.attachments.length).to.equal(0);
        expect(Clock.hasClockOutput.listeners.length).to.equal(0);
        Speaker.detachFromPreviousBlock(Sine, 'Samples', 'Channel1');
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
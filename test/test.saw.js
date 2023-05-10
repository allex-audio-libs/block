function destructBlock (block) {
    var as=block.attachments;
    block.destroy();
    expect(as.length).to.equal(0);
}

describe('Test Saw', function () {
    it('Load Lib', function () {
        return setGlobal('Lib', require('..')(execlib)); //Lib will export only the EventLite class
    });
    it('See Lib', function () {
        console.log('Lib', Lib);
    });
    it('Create Clock', function () {
        return setGlobal('Clock', new Lib.Clock());
    });
    it('Create Saw Generator', function () {
        return setGlobal('Saw', new Lib.SawGenerator());
    });
    it('Create Speaker', function () {
        return setGlobal('Speaker', new Lib.Speaker());
    });
    it('Connect\'em all', function () {
        Clock.setSampleRate(44100);
        Saw.attachToPreviousBlock(Clock, 'Clock', 'Clock');
        Speaker.attachToPreviousBlock(Clock, 'SampleRate', 'SampleRate');
        Speaker.attachToPreviousBlock(Saw, 'Samples', 'Channel1');
    });
    it('Wait', function () {
        this.timeout(1e7);
        return lib.q.delay(5000, true);
    });
    it('Disconnect\'em all', function () {
        Saw.detachFromPreviousBlock(Clock, 'Clock', 'Clock');
        expect(Saw.attachments.length).to.equal(0);
        expect(Clock.hasClockOutput.listeners.length).to.equal(0);
        Speaker.detachFromPreviousBlock(Saw, 'Samples', 'Channel1');
        Speaker.detachFromPreviousBlock(Clock, 'SampleRate', 'SampleRate');
        expect(Speaker.attachments.length).to.equal(0);
        expect(Saw.hasSamplesOutput.listeners.length).to.equal(0);
    });
    it ('Kill Clock', function () {
        destructBlock(Clock);
        destructBlock(Saw);
        destructBlock(Speaker);
    });
});
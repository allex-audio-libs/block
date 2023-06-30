function destructBlock (block) {
    var as=block.attachments;
    block.destroy();
    expect(as.length).to.equal(0);
}

describe('Test Triangle', function () {
    it('Load Lib', function () {
        return setGlobal('Lib', require('..')(execlib)); //Lib will export only the EventLite class
    });
    it('See Lib', function () {
        console.log('Lib', Lib);
    });
    it('Create Clock', function () {
        return setGlobal('Clock', new Lib.Clock());
    });
    it('Create Triangle Generator', function () {
        return setGlobal('Triangle', new Lib.TriangleGenerator());
    });
    it('Create Speaker', function () {
        return setGlobal('Speaker', new Lib.Speaker());
    });
    it('Connect\'em all', function () {
        Clock.setSampleRate(44100);
        Triangle.attachToPreviousBlock(Clock, 'Clock', 'Clock');
        Speaker.attachToPreviousBlock(Clock, 'Clock', 'Clock');
        Speaker.attachToPreviousBlock(Clock, 'SampleRate', 'SampleRate');
        Speaker.attachToPreviousBlock(Triangle, 'Samples', 'Channel1');
    });
    it('Wait', function () {
        this.timeout(1e7);
        return lib.q.delay(5000, true);
    });
    it('Disconnect\'em all', function () {
        Triangle.detachFromPreviousBlock(Clock, 'Clock', 'Clock');
        expect(Triangle.attachments.length).to.equal(0);
        expect(Clock.hasClockOutput.listeners.length).to.equal(0);
        Speaker.detachFromPreviousBlock(Triangle, 'Samples', 'Channel1');
        Speaker.detachFromPreviousBlock(Clock, 'SampleRate', 'SampleRate');
        Speaker.detachFromPreviousBlock(Clock, 'Clock', 'Clock');
        expect(Speaker.attachments.length).to.equal(0);
        expect(Triangle.hasSamplesOutput.listeners.length).to.equal(0);
    });
    it ('Kill Clock', function () {
        destructBlock(Clock);
        destructBlock(Triangle);
        destructBlock(Speaker);
    });
});
function destructBlock (block) {
    var as=block.attachments;
    block.destroy();
    expect(as.length).to.equal(0);
}

describe('Test Square', function () {
    it('Load Lib', function () {
        return setGlobal('Lib', require('..')(execlib)); //Lib will export only the EventLite class
    });
    it('See Lib', function () {
        console.log('Lib', Lib);
    });
    it('Create Clock', function () {
        return setGlobal('Clock', new Lib.Clock());
    });
    it('Create Square Generator', function () {
        return setGlobal('Square', new Lib.SquareGenerator());
    });
    it('Create Speaker', function () {
        return setGlobal('Speaker', new Lib.Speaker());
    });
    it('Connect\'em all', function () {
        Clock.setSampleRate(44100);
        Square.attachToPreviousBlock(Clock, 'Clock', 'Clock');
        Speaker.attachToPreviousBlock(Clock, 'Clock', 'Clock');
        Speaker.attachToPreviousBlock(Clock, 'SampleRate', 'SampleRate');
        Speaker.attachToPreviousBlock(Square, 'Samples', 'Channel1');
    });
    it('Wait', function () {
        this.timeout(1e7);
        return lib.q.delay(5000, true);
    });
    it('Disconnect\'em all', function () {
        Square.detachFromPreviousBlock(Clock, 'Clock', 'Clock');
        expect(Square.attachments.length).to.equal(0);
        expect(Clock.hasClockOutput.listeners.length).to.equal(0);
        Speaker.detachFromPreviousBlock(Square, 'Samples', 'Channel1');
        Speaker.detachFromPreviousBlock(Clock, 'SampleRate', 'SampleRate');
        Speaker.detachFromPreviousBlock(Clock, 'Clock', 'Clock');
        expect(Speaker.attachments.length).to.equal(0);
        expect(Square.hasSamplesOutput.listeners.length).to.equal(0);
    });
    it ('Kill Clock', function () {
        destructBlock(Clock);
        destructBlock(Square);
        destructBlock(Speaker);
    });
});
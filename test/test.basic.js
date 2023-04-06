describe('Test Basic', function () {
    it('Load Lib', function () {
        return setGlobal('Lib', require('..')(execlib)); //Lib will export only the EventLite class
    });
    it('See Lib', function () {
        console.log('Lib', Lib);
    });
    it('Create Clock', function () {
        return setGlobal('Clock', new Lib.Clock());
    });
    it('Set clock, listen and Wait', function () {
        this.timeout(1e7);
        Clock.setSampleRate(44100);
        Clock.hasClockOutput.attach(console.log.bind(console, 'tick!'));
        return lib.q.delay(1000, true);
    });
    it ('Kill Clock', function () {
        Clock.destroy();
    });
});
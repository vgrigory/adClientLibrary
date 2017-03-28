describe('adClientLibrary - unit tests', function() {
    var request, myAdInstance;

    beforeAll(function() {
        var el = document.createElement('div');
        el.id = 'topBanner';
        document.body.appendChild(el);
    });

    beforeEach(function() {
        jasmine.Ajax.install();
        jasmine.clock().install();

        myAdInstance = new wisp.AdClientLibrary({
            'containerId': 'topBanner',
            'updateInterval': 1
        });
    });

    it('prefetchAd()', function() {
        myAdInstance.prefetchAd();

        request = jasmine.Ajax.requests.mostRecent();
        expect(request.url).toBe('https://5xhlcfzk8c.execute-api.eu-west-1.amazonaws.com/prod/mock-engine');
        expect(request.method).toBe('GET');

        request.respondWith({
            'ad': '<a href=\'WS_DYN_INS_LINKURL\'><img src=\'http://resource.widespace.com/widespace/ads/testads/panorama728x90.jpg\' style=\'border:0\' /></a>'
        });

        expect(myAdInstance.adPool.length).toBe(1);
    });

    it('runAd() - adPool length (prefetch) should decrease after runAd()', function() {
        myAdInstance.prefetchAd();

        request = jasmine.Ajax.requests.mostRecent();

        request.respondWith({
            'ad': '<a href=\'WS_DYN_INS_LINKURL\'><img src=\'http://resource.widespace.com/widespace/ads/testads/panorama728x90.jpg\' style=\'border:0\' /></a>'
        });

        expect(myAdInstance.adPool.length).toBe(1);

        myAdInstance.runAd();

        expect(myAdInstance.adPool.length).toBe(0);
    });

    it('runAd() - test interval', function() {
        expect(myAdInstance.intervalId).not.toBeDefined();

        spyOn(myAdInstance, 'runAd').and.callThrough();

        myAdInstance.runAd();

        request = jasmine.Ajax.requests.mostRecent();
        expect(request.url).toBe('https://5xhlcfzk8c.execute-api.eu-west-1.amazonaws.com/prod/mock-engine');
        expect(request.method).toBe('GET');

        request.respondWith({
            'ad': '<a href=\'WS_DYN_INS_LINKURL\'><img src=\'http://resource.widespace.com/widespace/ads/testads/panorama728x90.jpg\' style=\'border:0\' /></a>'
        });

        expect(myAdInstance.adPool.length).toBe(0);
        expect(myAdInstance.intervalId).toBeDefined();

        jasmine.clock().tick(2001);

        expect(myAdInstance.runAd.calls.count()).toBe(3);
    });

    it('setUpdateInterval() - called at the beggining, before runAd()', function() {
        myAdInstance.setUpdateInterval(5);

        spyOn(myAdInstance, 'runAd').and.callThrough();

        expect(myAdInstance.runAd.calls.count()).toBe(0);

        myAdInstance.runAd();

        jasmine.clock().tick(4001);
        expect(myAdInstance.runAd.calls.count()).toBe(1);
    });

    it('setUpdateInterval()', function() {
        spyOn(myAdInstance, 'runAd').and.callThrough();

        expect(myAdInstance.runAd.calls.count()).toBe(0);

        myAdInstance.runAd();

        myAdInstance.setUpdateInterval(2);

        // with initial setup (1s interval), after 8th second, runAd() should have been called 9 times
        // but after first call we changed interval to 2 second, so it has been called only 5 times
        jasmine.clock().tick(8001);
        expect(myAdInstance.runAd.calls.count()).toBe(5);
    });

    it('testing constructor - invalid "containerId"', function() {
        spyOn(console, 'error').and.callThrough();

        var adInstance = new wisp.AdClientLibrary({
            'containerId': 'topBannerrrr',
            'updateInterval': 5
        });

        expect(console.error.calls.count()).toBe(1);
        expect(console.error).toHaveBeenCalledWith('Wrong "containerId" - "topBannerrrr". There is no such element with that id.');

        spyOn(adInstance, 'runAd').and.callThrough();

        adInstance.runAd();

        jasmine.clock().tick(8001);
        expect(adInstance.runAd.calls.count()).toBe(1);
    });

    it('testing constructor - invalid "updateInterval"', function() {
        spyOn(console, 'error').and.callThrough();

        var adInstance = new wisp.AdClientLibrary({
            'containerId': 'topBanner',
            'updateInterval': '5aa'
        });

        expect(console.error.calls.count()).toBe(1);
        expect(console.error).toHaveBeenCalledWith('Wrong "updateInterval" - "5aa". Please provide valid number.');
    });

    afterEach(function() {
        jasmine.Ajax.uninstall();
        jasmine.clock().uninstall();
    });
});
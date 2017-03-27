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

    afterEach(function() {
        jasmine.Ajax.uninstall();
        jasmine.clock().uninstall();
    });
});
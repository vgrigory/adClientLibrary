export default class AdClientLibrary {
    constructor(config) {
        this.config = config;
        this.adPool = [];
        this.adServerUrl = 'https://5xhlcfzk8c.execute-api.eu-west-1.amazonaws.com/prod/mock-engine';
        this.isAdBeingFetched = false;
    }

    runAd() {
        if (this.adPool.length) {
            let adData = this.adPool.pop();

            document
                .getElementById(this.config.containerId)
                .innerHTML = adData.ad;

            return;
        }

        if (this.isAdBeingFetched) {
            return;
        }

        let request = new XMLHttpRequest();

        request.responseType = 'json';
        request.addEventListener('progress', () => {
            this.isAdBeingFetched = true;
        });
        request.addEventListener('error', () => {
            this.isAdBeingFetched = false;
        });
        request.addEventListener('abort', () => {
            this.isAdBeingFetched = false;
        });
        request.addEventListener('load', () => {
            this.isAdBeingFetched = false;

            document
                .getElementById(this.config.containerId)
                .innerHTML = request.response.ad;
        });
        request.open('GET', this.adServerUrl);
        request.send();

        if (!this.intervalId) {
            this.intervalId = setInterval(this.runAd.bind(this), this.config.updateInterval * 1000);
        }
    }

    prefetchAd() {
        let request = new XMLHttpRequest();

        request.responseType = 'json';
        request.addEventListener('load', () => {
            this.adPool.push(request.response);
        });
        request.open('GET', this.adServerUrl);
        request.send();
    }

    setUpdateInterval(interval) {
        clearInterval(this.intervalId);
        this.config.updateInterval = interval;
        this.intervalId = setInterval(this.runAd.bind(this), this.config.updateInterval * 1000);
    }
};
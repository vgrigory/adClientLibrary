export default class AdClientLibrary {
    constructor(config) {
        this.config = config;
        this.adPool = [];
        this.adServerUrl = 'https://5xhlcfzk8c.execute-api.eu-west-1.amazonaws.com/prod/mock-engine';//?forceAdId=2';
        this.isAdBeingFetched = false;

        this.adContainer = document.getElementById(this.config.containerId);

        if (!this.adContainer) {
            console.error('Wrong "containerId" - "' + this.config.containerId + '". There is no such element with that id.');
        }

        if (isNaN(this.config.updateInterval % 1)) {
            console.error('Wrong "updateInterval" - "' + this.config.updateInterval + '". Please provide valid number.');
        }
    }

    runAd() {
        if (!this.adContainer) {
            return;
        }

        if (this.adPool.length) {
            let adData = this.adPool.pop();

            this.adContainer.innerHTML = adData.ad;
            this.handleScripts();

            if (!this.intervalId) {
                this.intervalId = setInterval(this.runAd.bind(this), this.config.updateInterval * 1000);
            }

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

            this.adContainer.innerHTML = request.response.ad;
            this.handleScripts();
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
        if (!this.intervalId) {
            this.config.updateInterval = interval;

            return;
        }

        clearInterval(this.intervalId);
        this.config.updateInterval = interval;
        this.intervalId = setInterval(this.runAd.bind(this), this.config.updateInterval * 1000);
    }

    handleScripts() {
        let scriptsHtmlCollection = this.adContainer.getElementsByTagName('script');
        let scriptsArray = [];
        let i;

        // converting scriptsHtmlCollection into an array just for convenience, mainly for sorting
        // (in case no sorting is required, we can skip this part to and loop over collection itself)
        for(i = 0; i < scriptsHtmlCollection.length; i++) {
            scriptsArray.push(scriptsHtmlCollection[i]);
        }

        // sorting scripts to have libs (which don't have innerHTML) on top for right dependency order
        // but maybe we can skip this, and rely on ad providers (API, .., ..) to not complicate things
//         scriptsArray.sort((prev, next) => {
//             if (!prev.innerHTML && next.innerHTML) {
//                 return -1;
//             }

//             if (prev.innerHTML && !next.innerHTML) {
//                 return 1;
//             }

//             return 0;
//         });

        // as just inserting <script> into DOM
        // via innerHTML of ad container doesn't make it work
        // here we create script nodes/elements and append them into parent container.
        // By default scripts are being run/loaded synchronously, so if they are in correct dependency order
        // everything should just work :)
        scriptsArray.forEach((scriptElement) => {
            var newScript = document.createElement('script');

            newScript.type = 'text/javascript';

            if (scriptElement.src) {
                newScript.src = scriptElement.src;
            }

            if (scriptElement.innerHTML) {
//                 newScript.text = scriptElement.innerHTML.replace(/setInterval/, 'var adScriptIntervalId = setInterval'); // this solution is also unreliable
                newScript.text = scriptElement.innerHTML;
            }

            this.adContainer.removeChild(scriptElement);
            this.adContainer.appendChild(newScript);
        });

        // using window.adScriptIntervalId instead of adScriptIntervalId here just to avoid errors about undefined variable
        // in console (as not every ad may contain scripts with intervals)
        // which are thrown because of class body declaration and expressions are evaluated in "strict" mode
//         if (window.adScriptIntervalId) {
//             // following are thoughts which came to my mind in the process of having final solution:
//             //
//             // in order to clear intervals which are remained after <script>
//             // have been removed from ad container (another ad has been arrived)
//             // it would be good that those scripts preserve interval id in a variable (but this way we enforcing a condition to ad providers)
//             // which later can be used here (to observe when script is removed from ad container and clear interval).
//             //
//             // Othervise similar code needs to be included in those <script> itself, so it can do observation on its own and clear introduced intervals
//             // (but observing generic parent, e.g. document.getElementById('adWS_DYN_INS_RAND').parentNode)
//             //
//             // Other solution might be to overwrite setInterval to store all intervalIds in an array and then do (new Error()).stack and analyse it
//             // in order to be able to differenciate between my and ad provider scripts (setInterval calls), but unfortunately Error.stack has a poor support
//             // for mobile (only Android 4.0 native browser, and Safari) - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack#Browser_compatibility
//             //
//             // Most reliable solution in my understanding is to have a convention.., backend can preprocess <script>s in order to provide frontend with array of interval ids
//             var obs = new MutationObserver(function(mutations, observer) {
//                 if(mutations[0].removedNodes.length) {
//                     clearInterval(window.adScriptIntervalId);
//                 }
//             });

//             obs.observe(this.adContainer, {childList: true});
//         }
    }
};
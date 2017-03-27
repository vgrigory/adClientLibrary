import AdClientLibrary from './lib/adClientLibrary.js';

// import '../styles/app.scss';

let wisp = {};

wisp.AdClientLibrary = AdClientLibrary;

let myAdInstance = new wisp.AdClientLibrary({
    'containerId': 'topBanner',
    'updateInterval': 1
});

myAdInstance.runAd();

let myAdInstance2 = new wisp.AdClientLibrary({
    'containerId': 'bottomBanner',
    'updateInterval': 5
});

myAdInstance2.runAd();

// setTimeout(function () {
//     console.log('changed interval');
//     myAdInstance.setUpdateInterval(10);
// },
// 5000);

export {AdClientLibrary};
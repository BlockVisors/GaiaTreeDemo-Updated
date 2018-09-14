var Gaiatrees = artifacts.require('Gaiatrees.sol');

contract('Gaiatrees', function (accounts) {
    var helpfulFunctions = require('./utils/GaiatreesUtils')(Gaiatrees, accounts);
    var hfn = Object.keys(helpfulFunctions);
    for( var i = 0; i < hfn.length; i++) {
        global[hfn[i]] = helpfulFunctions [hfn[i]];
    }

    checkTotalSupply(0);

    for (x = 0; x < 100; x++) {
        checkGaiatreeCreation('Gaiatree' + x);
    }

    checkTotalSupply(100)
});

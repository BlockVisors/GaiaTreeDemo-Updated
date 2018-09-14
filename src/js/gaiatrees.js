/* Main Object to manage Contract interactions */
var App = {
  contracts: {},
  GaiatreesAddress: '0x82644BdAB452C2675faB2C695E401Db6966268a2',

  init() {
    return App.initWeb3();
  },
  
  initWeb3() {
    if (typeof web3 !== 'undefined') {
      web3 = new Web3(web3.currentProvider);
    } else {
      web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
    return App.initContract();
  },

  initContract() {
    $.getJSON('Gaiatrees.json', (data) => {
      const GaiatreesArtifact = data;
      App.contracts.Gaiatrees = TruffleContract(GaiatreesArtifact);
      App.contracts.Gaiatrees.setProvider(web3.currentProvider) ;
      return App.loadGaiatrees();
    });
    return App.bindEvents();
  },

  loadGaiatrees() {
    web3.eth.getAccounts(function(err, accounts) {
      if (err != null) {
        console.error("An error occurred: " + err);
      } else if (accounts.length == 0) {
        console.log("User is not logged into MetaMask");
      } else {
        $('#card-row').children().remove();
      }
    });

    var address = web3.eth.defaultAccount;
    let contractInstance = App.contracts.Gaiatrees.at(App.GaiatreesAddress);
    return totalSupply = contractInstance.totalSupply().then((supply) => {
      for (var i = 0; i < supply; i++) {
        App.getGaiatreeDetails(i, address);
      }
    }).catch((err) => {
      console.log(err.message);
    });
  },

  getGaiatreeDetails(gaiatreeId, localAddress) {
    let contractInstance = App.contracts.Gaiatrees.at(App.GaiatreesAddress);
    return contractInstance.getToken(gaiatreeId).then((gaiatree) => {
      var gaiatreeJson = {
        'gaiatreeId'              : gaiatreeId,
        'gaiatreeName'            : gaiatree[0],
        'gaiatreeDna'             : gaiatree[1],
        'gaiatreePrice'           : web3.fromWei(gaiatree[2]).toNumber(),
        'gaiatreeNextPrice'       : web3.fromWei(gaiatree[3]).toNumber(),
        'ownerAddress'            : gaiatree[4]
      };
      if (gaiatreeJson.ownerAddress !== localAddress) {
        loadGaiatree(
          gaiatreeJson.gaiatreeId,
          gaiatreeJson.gaiatreeName,
          gaiatreeJson.gaiatreeDna,
          gaiatreeJson.gaiatreePrice,
          gaiatreeJson.gaiatreeNextPrice,
          gaiatreeJson.ownerAddress,
          false
        );
      } else {
        loadGaiatree(
          gaiatreeJson.gaiatreeId,
          gaiatreeJson.gaiatreeName,
          gaiatreeJson.gaiatreeDna,
          gaiatreeJson.gaiatreePrice,
          gaiatreeJson.gaiatreeNextPrice,
          gaiatreeJson.ownerAddress,
          true
        );
      }
    }).catch((err) => {
      console.log(err.message);
    });
  },


  handlePurchase(event) {
    event.preventDefault();

    var gaiatreeId = parseInt($(event.target.elements).closest('.btn-buy').data('id'));

    web3.eth.getAccounts((error, accounts) => {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];

      let contractInstance = App.contracts.Gaiatrees.at(App.GaiatreesAddress)
      contractInstance.priceOf(gaiatreeId).then((price) => {
        return contractInstance.purchase(gaiatreeId, {
          from: account,
          value: price,
        }).then(result => App.loadGaiatrees()).catch((err) => {
          console.log(err.message);
        });
      });
    });
  },

  bindEvents() {
    $(document).on('submit', 'form.gaiatree-purchase', App.handlePurchase);
  }

};

/* Generates a Gaiatree image based on Gaiatree DNA */
function generateGaiatreeImage(gaiatreeId, size, canvas){
  size = size || 10;
  var data = gaiatreeidparser(gaiatreeId);
  var canvas = document.getElementById(canvas);
  canvas.width = size * data.length;
  canvas.height = size * data[1].length;
  var ctx = canvas.getContext("2d");

  for(var i = 0; i < data.length; i++){
      for(var j = 0; j < data[i].length; j++){
          var color = data[i][j];
          if(color){
          ctx.fillStyle = color;
          ctx.fillRect(i * size, j * size, size, size);
          }
      }
  }return canvas.toDataURL();
}

/* Load Gaiatrees based on input data*/
function loadGaiatree(gaiatreeId, gaiatreeName, gaiatreeDna, gaiatreePrice, gaiatreeNextPrice, ownerAddress, locallyOwned) {
  var cardRow = $('#card-row');
  var cardTemplate = $('#card-template');

  if (locallyOwned) {
    cardTemplate.find('btn-buy').attr('disabled', true);
  } else {
    cardTemplate.find('btn-buy').removeAttr('disabled');
  }

  cardTemplate.find('.gaiatree-name').text(gaiatreeName);
  cardTemplate.find('.gaiatree-canvas').attr('id', "gaiatree-canvas-" + gaiatreeId);
  cardTemplate.find('.gaiatree-dna').text(gaiatreeDna);
  cardTemplate.find('.gaiatree-owner').text(ownerAddress);
  cardTemplate.find('.gaiatree-owner').attr("href", "https://etherscan.io/address/" + ownerAddress);
  cardTemplate.find('.btn-buy').attr('data-id', gaiatreeId);
  cardTemplate.find('.gaiatree-price').text(parseFloat(gaiatreePrice).toFixed(4));
  cardTemplate.find('.gaiatree-next-price').text(parseFloat(gaiatreeNextPrice).toFixed(4));

  cardRow.append(cardTemplate.html());
  generateGaiatreeImage(gaiatreeDna, 3, "gaiatree-canvas-" + gaiatreeId)
}

/* Called When Document has loaded */
jQuery(document).ready(
  function ($) {
    App.init();
  }
);

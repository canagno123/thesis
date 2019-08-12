App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    console.log("App Initialization.");
    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    console.log("Web3 Initialization.");
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
    }
    web3 = new Web3(App.web3Provider);
    web3.eth.defaultAccount = web3.eth.accounts[0];
    account = web3.eth.defaultAccount;
    console.log("Default Account: " + account);
    return App.initContract();
  },

  initContract: function() {
    console.log("Auction Initialization.");
    $.getJSON('Auction.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var AuctionArtifact = data;
    
      App.contracts.Auction = TruffleContract(AuctionArtifact);
    
      // Set the provider for our contract
      App.contracts.Auction.setProvider(App.web3Provider);
      return App;
    });
    $.getJSON('auctionExecutor.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var AuctionExecutorArtifact = data;
      App.contracts.auctionExecutor = TruffleContract(AuctionExecutorArtifact);
    
      // Set the provider for our contract
      App.contracts.auctionExecutor.setProvider(App.web3Provider);
    
      return App;
    });
    console.log("Contract Initialization.");
    $.getJSON('Contract.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var ContractArtifact = data;
      App.contracts.Contract = TruffleContract(ContractArtifact);
    
      // Set the provider for our contract
      App.contracts.Contract.setProvider(App.web3Provider);
        
      return App;
    });
    $.getJSON('contractExecutor.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var ContractExecutorArtifact = data;
      App.contracts.contractExecutor = TruffleContract(ContractExecutorArtifact);
    
      // Set the provider for our contract
      App.contracts.contractExecutor.setProvider(App.web3Provider);
      return App;
    });
    console.log("Rating Initialization.");
    $.getJSON('ProviderRating.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var ProviderRatingArtifact = data;
      App.contracts.ProviderRating = TruffleContract(ProviderRatingArtifact);
    
      // Set the provider for our contract
      App.contracts.ProviderRating.setProvider(App.web3Provider);
    
      return App;
    });
    console.log("Proof Initialization.");
    $.getJSON('StorageProof.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var StorageProofArtifact = data;
      App.contracts.StorageProof = TruffleContract(StorageProofArtifact);
    
      // Set the provider for our contract
      App.contracts.StorageProof.setProvider(App.web3Provider);
    
      return App;
    });
    console.log(App.contracts);

    //return App.bindEvents();
  },

  // bindEvents: function() {
  //   $("#button").click(function() {
  //     App.handleAdopt
  //   });
  // },

  markCancelled: function(statuses, account) {
    var contractExecutorInstance;

    App.contracts.contractExecutor.deployed().then(function(instance) {
    contractExecutorInstance = instance;

    return contractExecutorInstance.getContractStatuses.call();
    }).then(function(statuses) {
      for (i = 0; i < statuses.length; i++) {
        if (statuses[i] != '1') {
          $('.panel-pet').eq(i).find('button').text('Cancelled').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  searchContract: function(id) {
    console.log("Button Clicked");
    //var contractId = parseInt($(event.target).data('id'));
    contractId = id;
    console.log(contractId);
    var contractExecutorInstance;

    web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }


    App.contracts.contractExecutor.deployed().then(function(instance) {
      contractExecutorInstance = instance;
      console.log(contractExecutorInstance);
    // Return Contract Information
    return contractExecutorInstance.getContractInfo(id);
    }).then(function(result) {
        console.log(result[1]);
      }).catch(function(err) {
        console.log(err.message);
    });
// Return Contract Information
// return contractExecutorInstance.initContract(["C9876dc8e3057d6F5d61cA2d1F014770EE20d412", "E481bD70C062F510E727cB87d35126c619D0d3e7"],"fbC6D54b3C60B9717123E7e52A33646aa07918F8",1,1,1, {value:1});})
// .then(function(result) {
//     console.log(result);
//   }).catch(function(err) {
//     console.log(err.message);
// });

});

  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

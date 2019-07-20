App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load contracts.
    $.getJSON('../contracts.json', function(data) {
      var petsRow = $('#contractRow');
      var petTemplate = $('#contractTemplate');

      for (i = 0; i < data.length; i ++) {
        contractTemplate.find('.panel-title').text(data[i].client);
        contractTemplate.find('img').attr('src', data[i].picture);
        contractTemplate.find('.pet-breed').text(data[i].breed);
        contractTemplate.find('.pet-age').text(data[i].age);
        contractTemplate.find('.pet-location').text(data[i].location);
        contractTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        contractsRow.append(contractTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
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
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Auction.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var AuctionArtifact = data;
      App.contracts.Auction = TruffleContract(AuctionArtifact);
    
      // Set the provider for our contract
      App.contracts.Auction.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App;
    });
    $.getJSON('auctionExecutor.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var AuctionExecutorArtifact = data;
      App.contracts.auctionExecutor = TruffleContract(AuctionExecutorArtifact);
    
      // Set the provider for our contract
      App.contracts.auctionExecutor.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App;
    });
    $.getJSON('Contract.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var ContractArtifact = data;
      App.contracts.Contract = TruffleContract(ContractArtifact);
    
      // Set the provider for our contract
      App.contracts.Contract.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App.markCancelled;
    });
    $.getJSON('contractExecutor.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var ContractExecutorArtifact = data;
      App.contracts.contractExecutor = TruffleContract(ContractExecutorArtifact);
    
      // Set the provider for our contract
      App.contracts.contractExecutor.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App;
    });
    $.getJSON('ProviderRating.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var ProviderRatingArtifact = data;
      App.contracts.ProviderRating = TruffleContract(ProviderRatingArtifact);
    
      // Set the provider for our contract
      App.contracts.ProviderRating.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App;
    });
    $.getJSON('StorageProof.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var StorageProofArtifact = data;
      App.contracts.StorageProof = TruffleContract(StorageProofArtifact);
    
      // Set the provider for our contract
      App.contracts.StorageProof.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App;
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markCancelled: function(statuses, account) {
    var contractExecutorInstance;

    App.contracts.contractExecutor.deployed().then(function(instance) {
    contractExecutorInstance = instance;

    return contractExecutorInstance.getContractStatuses.call();
    }).then(function(statuses) {
      for (i = 0; i < statuses.length; i++) {
        if (statuses[i] != 1) {
          $('.panel-pet').eq(i).find('button').text('Cancelled').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var contractId = parseInt($(event.target).data('id'));

    var contractExecutorInstance;

    web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }

    var account = accounts[0];

    App.contracts.contractExecutor.deployed().then(function(instance) {
      contractExecutorInstance = instance;

    // Execute invalidate as a transaction by sending account
    return contractExecutorInstance.invalidateContract(contractId, {from: account});
    }).then(function(result) {
      return App.markCancelled();
      }).catch(function(err) {
      console.log(err.message);
    });
});

  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

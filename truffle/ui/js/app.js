App = {
  web3Provider: null,
  contracts: {},
  resContracts: null,

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
    console.log("Contract Button Clicked");
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
          console.log("Normal Call Contract" + result[1]);
          App.populateContractTable(result, id);
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
  },

  populateContractTable: function(contract, id){
    tabBody=document.getElementById("contractTableBody");
    row=document.createElement("tr");
    cell0 = document.createElement("td");
    cell1 = document.createElement("td");
    cell2 = document.createElement("td");
    cell3 = document.createElement("td");
    cell4 = document.createElement("td");
    cell5 = document.createElement("td");
    textnode0=document.createTextNode(id);
    textnode1=document.createTextNode(contract[0]);
    textnode2=document.createTextNode(contract[1]);
    textnode3=document.createTextNode(contract[2]);
    textnode4=document.createTextNode(contract[4]);
    var state = App.hex_to_ascii(contract[7]);
    textnode5=document.createTextNode(state);
    cell0.appendChild(textnode0);
    cell1.appendChild(textnode1);
    cell2.appendChild(textnode2);
    cell3.appendChild(textnode3);
    cell4.appendChild(textnode4);
    cell5.appendChild(textnode5);
    row.appendChild(cell0);
    row.appendChild(cell1);
    row.appendChild(cell2);
    row.appendChild(cell3);
    row.appendChild(cell4);
    row.appendChild(cell5);
    tabBody.appendChild(row);
  },

  searchAuction: function(id) {
    console.log("Auction Button Clicked");
    auctionId = id;
    console.log(auctionId);
    var auctionExecutorInstance;

    web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }


    App.contracts.auctionExecutor.deployed().then(function(instance) {
      auctionExecutorInstance = instance;
      console.log(auctionExecutorInstance);
    // Return Contract Information
    return auctionExecutorInstance.getAuctionInfo(auctionId);
    }).then(function(result) {
      console.log("Normal Call Auction" + result[1]);
      App.populateAuctionTable(result, id);
      }).catch(function(err) {
        console.log(err.message);
        });
    });
  },

  populateAuctionTable: function(auction, id){
    tabBody=document.getElementById("auctionTableBody");
    row=document.createElement("tr");
    cell0 = document.createElement("td");
    cell1 = document.createElement("td");
    cell2 = document.createElement("td");
    cell3 = document.createElement("td");
    cell4 = document.createElement("td");
    cell5 = document.createElement("td");
    textnode0=document.createTextNode(id);
    textnode1=document.createTextNode(auction[0]);
    textnode2=document.createTextNode(auction[2]);
    textnode3=document.createTextNode(auction[1]);
    textnode4=document.createTextNode(auction[3]);
    var state = App.hex_to_ascii(auction[6]);
    textnode5=document.createTextNode(state);
    cell0.appendChild(textnode0);
    cell1.appendChild(textnode1);
    cell2.appendChild(textnode2);
    cell3.appendChild(textnode3);
    cell4.appendChild(textnode4);
    cell5.appendChild(textnode5);
    row.appendChild(cell0);
    row.appendChild(cell1);
    row.appendChild(cell2);
    row.appendChild(cell3);
    row.appendChild(cell4);
    row.appendChild(cell5);
    tabBody.appendChild(row);
  },

  clearTable: function(tableBody){
    //var new_tbody = document.createElement(tableBody);
    //tableBody.parentNode.replaceChild(new_tbody, tableBody)
    var tb = document.getElementById(tableBody);

    // while tb has children, remove the first one
    while (tb.childNodes.length) {
      tb.removeChild(tb.childNodes[0]);
    }
  },

  hex_to_ascii: function(str1){
	  var hex  = str1.toString();
	  var str = '';
    for (var n = 0; n < hex.length; n += 2) {
		  str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	  } 
	  return str;
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

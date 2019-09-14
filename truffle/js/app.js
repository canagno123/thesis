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
    return App.getDeployedContracts();
  },

  getDeployedContracts: function() {
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
  },

  searchContract: function(id) {
    id;
    var contractExecutorInstance;

    web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }


    App.contracts.contractExecutor.deployed().then(function(instance) {
      contractExecutorInstance = instance;
    // Return Contract Information
    return contractExecutorInstance.getContractInfo(id);
    }).then(function(result) {
          App.populateContractTable(result, id);
        }).catch(function(err) {
          console.log("ERROR getting contract info for id: " + id);
          console.log(err.message);
        });
    });
  },

  initContract: function(providers, client, hash, collateral, price) {
    console.log("Contract Init Button Clicked with: " + providers + ", " + client + ", " + hash + ", " + collateral + ", " + price + ".");
    var contractExecutorInstance;

    web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }


    App.contracts.contractExecutor.deployed().then(function(instance) {
      contractExecutorInstance = instance;
    // Return Contract Information
    var providerArray = providers.split(",");
    return contractExecutorInstance.initContract(providerArray,client,App.ascii_to_hex(hash),collateral,price, {value:web3.toWei(collateral,"wei")});
    }).then(function(result) {
          console.log("Initiating contract..");
        }).catch(function(err) {
          console.log(err.message);
        });
    });
  },

  terminateContract: function(id) {
    console.log("Contract Termination Button Clicked with: " + id + ".");
    var contractExecutorInstance;

    web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }


    App.contracts.contractExecutor.deployed().then(function(instance) {
      contractExecutorInstance = instance;
    // Return Contract Information
    return contractExecutorInstance.initContract(providerArray,client,App.ascii_to_hex(hash),collateral,price, {value:web3.toWei(collateral,"wei")});
    }).then(function(result) {
          console.log("Initiating contract..");
        }).catch(function(err) {
          console.log(err.message);
        });
    });
  },

  payContract: function(id) {
    console.log("Pay Contract Button Clicked with id: " + id);
    var contractExecutorInstance;

    web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }


    App.contracts.contractExecutor.deployed().then(function(instance) {
      contractExecutorInstance = instance;
    // Return Contract Information
    return contractExecutorInstance.getContractInfo(id);
    }).then(function(result) {
          console.log("Getting Contract Price: " + result[2]);
          App.contracts.contractExecutor.deployed().then(function(instance) {
            contractExecutorInstance = instance;
            console.log("Paying contract " + id + ", " + result[2] + " wei.");
          // Return Contract Information
          return contractExecutorInstance.pay(id, {value:web3.toWei(result[2],"wei")});
          }).then(function(result) {
                console.log("Successfull Payment: " + result);
              }).catch(function(err) {
                console.log("ERROR paying contract with id: " + id);
                console.log(err.message);
              });
        }).catch(function(err) {
          console.log("ERROR getting contract price for id: " + id);
          console.log(err.message);
        });
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
    cell6 = document.createElement("td");
    cell7 = document.createElement("td");
    textnode0=document.createTextNode(id);
    textnode1=document.createTextNode(App.clearAddressList(contract[0]));
    textnode2=document.createTextNode(contract[1].substring(2, 10));
    textnode3=document.createTextNode(contract[2]);
    textnode4=document.createTextNode(contract[4]);
    var state = App.hex_to_ascii(contract[7]);
    textnode5=document.createTextNode(state);
    var payLink = document.createElement("a");
    var textnode6 = document.createTextNode("Pay Contract");
    payLink.style.color = "blue";
    payLink.appendChild(textnode6);
    payLink.addEventListener('click', function() {
      App.payContract(id);
    }, false);
    var terminateLink = document.createElement("a");
    var textnode7 = document.createTextNode("Terminate Contract");
    terminateLink.style.color = "blue";
    terminateLink.appendChild(textnode7);
    terminateLink.addEventListener('click', function() {
      App.terminateContract(id);
    }, false);
    cell0.appendChild(textnode0);
    cell1.appendChild(textnode1);
    cell2.appendChild(textnode2);
    cell3.appendChild(textnode3);
    cell4.appendChild(textnode4);
    cell5.appendChild(textnode5);
    cell6.appendChild(payLink);
    cell7.appendChild(terminateLink);
    row.appendChild(cell0);
    row.appendChild(cell1);
    row.appendChild(cell2);
    row.appendChild(cell3);
    row.appendChild(cell4);
    row.appendChild(cell5);
    row.appendChild(cell6);
    row.appendChild(cell7);
    tabBody.appendChild(row);
  },

  searchAuction: function(id) {
    // console.log("Auction Button Clicked with id: " + id);
    var auctionExecutorInstance;

    web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }


    App.contracts.auctionExecutor.deployed().then(function(instance) {
      auctionExecutorInstance = instance;
      console.log("getting auction info for id: " + id);
      // Return Auction Information
    return auctionExecutorInstance.getAuctionInfo(id);
    }).then(function(result) {
      console.log("Normal Call Auction" + result[1]);
      App.populateAuctionTable(result, id);
      }).catch(function(err) {
        console.log("ERROR getting auction info for id: " + id);
        console.log(err.message);
        });
    });
  },

  initAuction: function(provNum, fileSize, collateralAuction, hashAuction) {
    console.log("Auction Init Button Clicked with: " + provNum +  ", " + fileSize + ", " + collateralAuction + ", " + hashAuction + "." );
    var auctionExecutorInstance;

    web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }


    App.contracts.auctionExecutor.deployed().then(function(instance) {
      auctionExecutorInstance = instance;
    // Return Auction Information
    return auctionExecutorInstance.initAuction(provNum, fileSize, collateralAuction, App.ascii_to_hex(hashAuction));
    }).then(function(result) {
          console.log("Initiating auction..");
        }).catch(function(err) {
          console.log(err.message);
        });
    });
  },

  bidAuction: function(id, bidValue){
    console.log("Easy: " + id + " " + "value: " + bidValue);
    console.log("Auction Button Clicked with id: " + id);
    var auctionExecutorInstance;

    web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }
    App.contracts.auctionExecutor.deployed().then(function(instance) {
      auctionExecutorInstance = instance;
      console.log("getting auction info for id: " + id);
    // Return Auction Information
  return auctionExecutorInstance.bid(id, {value:web3.toWei(bidValue,"wei")});
    }).then(function(result) {
      console.log("Bidded.")
    }).catch(function(err) {
      console.log(err.message);
      });
    });
  },

  completeAuction: function(id){
    console.log("Easy completion: " + id);
    console.log("Auction Completion Button Clicked with id: " + id);
    var auctionExecutorInstance;
    var contractExecutorInstance;

    web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }
    App.contracts.auctionExecutor.deployed().then(function(instance) {
      auctionExecutorInstance = instance;
    // Complete Auction
  return auctionExecutorInstance.completeAuction(id);
    }).then(function(result) {
      console.log("Auction "+ id + " completed.")
      App.contracts.auctionExecutor.deployed().then(function(instance) {
        auctionExecutorInstance = instance;
      // Return Auction Information
      console.log("Getting information of auction with id " + id + " to create a contract.")
      return auctionExecutorInstancontractcontractce.getAuctionInfo(id);
      }).then(function(result) {
        console.log("Initiating contract for: " + result[0] + " providers, " +
        result[1] + " client, " + result[2] + " price list, " +  result[8] + " collateral, " + 
        result[9] + " rootHash.")
        App.contracts.contractExecutor.deployed().then(function(instance) {
          contractExecutorInstance = instance;
        // Return Auction Information
        console.log("Getting information of auction with id " + id + " to create a contract.")
        return contractExecutorInstance.initContract(result[0],result[1],result[9],result[8], App.getTableAverage(result[2]), {value:web3.toWei(result[8],"wei")});
        }).then(function(result) {
          console.log("Contract succesfully initiated.")
        }).catch(function(err) {
          console.log(err.message);
          });
      }).catch(function(err) {
        console.log(err.message);
        });
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
    cell6 = document.createElement("td");
    cell7 = document.createElement("td");
    cell8 = document.createElement("td");
    cell9 = document.createElement("td");
    cell10 = document.createElement("td");
    cell11 = document.createElement("td");
    textnode0=document.createTextNode(id);
    textnode1=document.createTextNode(App.clearAddressList(auction[0]));
    textnode2=document.createTextNode(App.clearPriceList(auction[2]));
    textnode3=document.createTextNode(auction[1].substring(2, 10));
    textnode4=document.createTextNode(auction[3]);
    textnode5=document.createTextNode(auction[7]);
    textnode6=document.createTextNode(auction[8]);
    textnode7=document.createTextNode(App.hex_to_ascii(auction[9]));
    var state = App.hex_to_ascii(auction[6]);
    textnode8=document.createTextNode(state);
    var bidLink = document.createElement("a");
    var textnode9 = document.createTextNode("Bid for Auction");
    bidLink.style.color = "blue";
    bidLink.appendChild(textnode9);
    bidLink.addEventListener('click', function() {
      App.bidAuction(id, bidInput.value);
    }, false);
    var completeAuctionLink = document.createElement("a");
    var textnode10 = document.createTextNode("Complete Auction");
    completeAuctionLink.style.color = "blue";
    completeAuctionLink.appendChild(textnode10);
    completeAuctionLink.addEventListener('click', function() {
      App.completeAuction(id);
    }, false);
    var bidInput = document.createElement("INPUT");
    bidInput.setAttribute("type", "text");
    cell0.appendChild(textnode0);
    cell1.appendChild(textnode1);
    cell2.appendChild(textnode2);
    cell3.appendChild(textnode3);
    cell4.appendChild(textnode4);
    cell5.appendChild(textnode5);
    cell6.appendChild(textnode6);
    cell7.appendChild(textnode7);
    cell8.appendChild(textnode8);
    cell9.appendChild(bidLink);
    cell10.appendChild(bidInput);
    cell11.appendChild(completeAuctionLink);
    row.appendChild(cell0);
    row.appendChild(cell1);
    row.appendChild(cell2);
    row.appendChild(cell3);
    row.appendChild(cell4);
    row.appendChild(cell5);
    row.appendChild(cell6);
    row.appendChild(cell7);
    row.appendChild(cell8);
    row.appendChild(cell9);
    row.appendChild(cell10);
    row.appendChild(cell11);
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
  },

  ascii_to_hex(str){
	  var arr1 = [];
	  for (var n = 0, l = str.length; n < l; n ++) {
		  var hex = Number(str.charCodeAt(n)).toString(16);
		  arr1.push(hex);
	  }
	  return arr1.join('');
  },

  clearAddressList(providersList){
    console.log(providersList[0] + providersList[1] + providersList[2] + String(providersList.length));
    
    for (var i=0, l = providersList.length; i < l; i++){
      if(providersList[i] == "0x0000000000000000000000000000000000000000"){
        providersList.splice(i, 1);
        break;
      }
    }
    for (var i=0, l = providersList.length; i < l; i++){
      providersList[i] = providersList[i].substring(2, 10);

    }
    return providersList;
  },

  clearPriceList(priceList){
    for (var i=0, l = priceList.length; i < l; i++){
      if(priceList[i] == "0"){
        priceList.splice(i, 1);
        break;
      }
    }
    return priceList;
  },

  getTableAverage(priceList){
    var sum = 0;
    console.log("Before: " + priceList);
    priceList = App.clearPriceList(priceList);
    console.log("After: " + priceList);
    for (var i=0, l = priceList.length; i < l; i++){
      sum += parseInt(priceList[i]);
    }
    console.log("Sum: " + sum);
    console.log("size: " + priceList.length);
    console.log("unround: " + sum/priceList.length)
    console.log("round: " + Math.round(sum/priceList.length));
    return Math.round(sum/priceList.length);
  }


};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

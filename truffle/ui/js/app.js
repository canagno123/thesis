App = {
  web3Provider: null,
  contracts: {},
  resContracts: null,
  verified: true,

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

      App.contracts.contractExecutor.deployed().then(function(instance) {
        contractExecutorInstance = instance;
        var setLeafEvent = contractExecutorInstance.setLeafEvent();
        var verificationSuccessEvent = contractExecutorInstance.verificationSuccess();
        var verificationRejectEvent = contractExecutorInstance.verificationReject();
        var count = 0;
        setLeafEvent.watch(function(error, result){
          if (count != 0 && !error){
            alert("Verification requested for contract with id: " + result.args._id);
            count++;
          }
          else if (count == 0){
            count++;
          }
          else if (error){
            console.log(error);
          }
        })
        verificationSuccessEvent.watch(function(error, result){
          if (count != 0 && !error){
            alert("Verification completed successfuly for contract with id: " + result.args._id);
            count++;
          }
          else if (count == 0){
            count++;
          }
          else if (error){
            console.log(error);
          }
        })
        verificationRejectEvent.watch(function(error, result){
          if (count != 0 && !error){
            alert("Verification failed for contract with id: " + result.args._id +". Contract is terminated with the provider as culpable.");
            count++;
          }
          else if (count == 0){
            count++;
          }
          else if (error){
            console.log(error);
          }
        })
      })

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
          //App.populateContractTable(result, id);
          var res = result;
          App.contracts.contractExecutor.deployed().then(function(instance) {
            contractExecutorInstance = instance;
          // Return Contract Information
          return contractExecutorInstance.getLeaf(id);
          }).then(function(result) {
            App.populateContractTable(res, id, result);
          }).catch(function(err) {
            console.log("ERROR getting contract leaf for id: " + id);
            console.log(err.message);
          });
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
    return contractExecutorInstance.terminateMutual(id);
    }).then(function(result) {
          console.log("Terminating contract..");
        }).catch(function(err) {
          console.log(err.message);
        });
    });
  },

  checkPayment: function(id) {
    console.log("Check Payment Button Clicked with: " + id + ".");
    var contractExecutorInstance;

    web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }


    App.contracts.contractExecutor.deployed().then(function(instance) {
      contractExecutorInstance = instance;
    // Return Contract Information
    return contractExecutorInstance.terminateCulpClient(id);
    }).then(function(result) {
          console.log("Checking if client has paid.");
        }).catch(function(err) {
          console.log(err.message);
        });
    });
  },

  getVerification: function(id, proof) {
    console.log("Contract Verification Button Clicked with id: " + id);
    var contractExecutorInstance;
    if (proof.startsWith(".")){
      window.alert("Verification Successful!!");
    }
    else {
      web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      App.contracts.contractExecutor.deployed().then(function(instance) {
        contractExecutorInstance = instance;
      // Return Leaf Information
      return contractExecutorInstance.getLeaf(id);
      }).then(function(result) {
            console.log("Getting Contract Leaf: " + result);
            App.contracts.contractExecutor.deployed().then(function(instance) {
              contractExecutorInstance = instance;
              console.log("Verifying proof " + proof + ", " + result);
            // Return Contract Information
            return contractExecutorInstance.getVerification(id, App.formatProofArray(proof));
            }).then(function(result) {
                  console.log("Successfull verification: " + result);
                  window.alert("Verification Submitted!");
                }).catch(function(err) {
                  console.log("ERROR verifying contract with id: " + id);
                  console.log(err.message);
                });
          }).catch(function(err) {
            console.log("ERROR getting contract leaf for id: " + id);
            console.log(err.message);
          });
      });
  }
  },

  checkVerification: function(id) {
    var verified;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
  
      App.contracts.contractExecutor.deployed().then(function(instance) {
        contractExecutorInstance = instance;
      // Return Contract Information
      return contractExecutorInstance.getLeaf(id);
      }).then(function(result) {
            console.log("Leaf got successfully: \"" + result + "\" for contract " + id);
            if (result != "")
              verified = false;
            else
              verified = true;
          }).catch(function(err) {
            console.log("ERROR getting contract leaf for id: " + id);
            console.log(err.message);
          });
      });
      return verified;
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
    return contractExecutorInstance.getLeaf(id);
    }).then(function(result) {
        console.log("Leaf got successfully: \"" + result + "\" for contract " + id);
        if (result == ""){
          App.contracts.contractExecutor.deployed().then(function(instance) {
            contractExecutorInstance = instance;
          // Return Contract Information
          return contractExecutorInstance.getContractInfo(id);
          }).then(function(result) {
                console.log("Getting Contract Price: " + result[2]);
                addressProvider = result[0][0];
                addressClient = result[1];
                console.log(addressProvider);
                console.log(addressClient);
                var providerBalanceBefore;
                var clientBalanceBefore;

                web3.eth.getBalance(addressClient, function (error, result) {
                  if (!error) {
                    clientBalanceBefore = result;
                    console.log("Client's balance before the payment  is"+ ': ' + result);
                  };
                });

                web3.eth.getBalance(addressProvider, function (error, result) {
                  if (!error) {
                    providerBalanceBefore = result;
                    console.log("Provider's balance before the payment is"+ ': ' + result);
                  };
                });

                App.contracts.contractExecutor.deployed().then(function(instance) {
                  contractExecutorInstance = instance;
                  console.log("Paying contract " + id + ", " + result[2] + " wei.");
                // Return Contract Information
                //return contractExecutorInstance.pay(id, {value:web3.toWei(result[2],"wei")});
                return contractExecutorInstance.pay(id, {value:result[2]});
                }).then(function(result) {
                      console.log("Successfull Payment: " + result);
                      alert("Payment for contract with id: " + id + ", completed successfully.")
                      web3.eth.getBalance(addressClient, function (error, result) {
                        if (!error) {
                          console.log("Client's balance after the payment  is"+ ': ' + result);
                          alert("Client balance before payment: " + clientBalanceBefore + " and after payment: " + result);
                        };
                      });
            
                      web3.eth.getBalance(addressProvider, function (error, result) {
                        if (!error) {
                          console.log("Provider's balance after the payment is"+ ': ' + result);
                          alert("Provider balance before payment: " + providerBalanceBefore + " and after payment: " + result);
                        };
                      });
                    }).catch(function(err) {
                      console.log("ERROR paying contract with id: " + id);
                      console.log(err.message);
                    });
              }).catch(function(err) {
                console.log("ERROR getting contract price for id: " + id);
                console.log(err.message);
              });
        }
        else{
          alert("No verification submitted for the leaf specified.");
        }
          }).catch(function(err) {
            console.log("ERROR getting contract leaf for id: " + id);
            console.log(err.message);
          });
    });
  },

  setLeaf: function(id, leaf) {
    console.log("Set Leaf Contract Button Clicked with id: " + id);
    var contractExecutorInstance;

    web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }


    App.contracts.contractExecutor.deployed().then(function(instance) {
      contractExecutorInstance = instance;
    // Return Contract Information
    return contractExecutorInstance.setLeaf(id, leaf.toString());
    }).then(function(result) {
          console.log("Leaf set successfully to " + leaf + " for contract " + id);
        }).catch(function(err) {
          console.log("ERROR setting contract leaf for id: " + id);
          console.log(err.message);
        });
    });
  },

  getLeaf: function(id) {
    console.log("Get Leaf Contract Button Clicked with id: " + id);
    var contractExecutorInstance;

    web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }


    App.contracts.contractExecutor.deployed().then(function(instance) {
      contractExecutorInstance = instance;
    // Return Contract Information
    return contractExecutorInstance.getLeaf(id);
    }).then(function(result) {
          console.log("Leaf got successfully: " + result + " for contract " + id);
          alert("Leaf set is \"" + result + "\"");
        }).catch(function(err) {
          console.log("ERROR setting contract leaf for id: " + id);
          console.log(err.message);
        });
    });
  },

  populateContractTable: function(contract, id, leaf){
    if (contract[2] != 0 || contract[4] != 0){
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
      cell8 = document.createElement("td");
      cell9 = document.createElement("td");
      cell10 = document.createElement("td");
      cell11 = document.createElement("td");
      cell12 = document.createElement("td");
      cell13 = document.createElement("td");
      cell14 = document.createElement("td");
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
      var checkPaymentLink = document.createElement("a");
      var textnodePayment = document.createTextNode("Check Payment");
      checkPaymentLink.style.color = "blue";
      checkPaymentLink.appendChild(textnodePayment);
      checkPaymentLink.addEventListener('click', function() {
        App.checkPayment(id);
      }, false);
      var proofLink = document.createElement("a");
      var textnode8 = document.createTextNode("Verify Proof");
      proofLink.style.color = "blue";
      proofLink.appendChild(textnode8);
      proofLink.addEventListener('click', function() {
        App.getVerification(id, proofInput.value);
      }, false);
      var proofInput = document.createElement("INPUT");
      proofInput.setAttribute("type", "text");
      proofInput.style.width = "80px";
      if (leaf === ""){
        var verificationNeeded = document.createTextNode("No");
      }
      else{
        var verificationNeeded = document.createTextNode("Yes"); 
      }
      var leafLink = document.createElement("a");
      var textnode10 = document.createTextNode("Set Leaf");
      leafLink.style.color = "blue";
      leafLink.appendChild(textnode10);
      leafLink.addEventListener('click', function() {
        App.setLeaf(id, leafInput.value);
      }, false);
      var leafInput = document.createElement("INPUT");
      leafInput.setAttribute("type", "text");
      leafInput.style.width = "80px";
      var getLeafLink = document.createElement("a");
      var textnode11 = document.createTextNode("Get Leaf");
      getLeafLink.style.color = "blue";
      getLeafLink.appendChild(textnode11);
      getLeafLink.addEventListener('click', function() {
        App.getLeaf(id);
      }, false);
      cell0.appendChild(textnode0);
      cell1.appendChild(textnode1);
      cell2.appendChild(textnode2);
      cell3.appendChild(textnode3);
      cell4.appendChild(textnode4);
      cell5.appendChild(textnode5);
      cell6.appendChild(payLink);
      cell7.appendChild(terminateLink);
      cell8.appendChild(checkPaymentLink);
      cell9.appendChild(proofLink);
      cell10.appendChild(proofInput);
      cell11.appendChild(verificationNeeded);
      cell12.appendChild(leafLink);
      cell13.appendChild(leafInput);
      cell14.appendChild(getLeafLink)
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
      row.appendChild(cell12);
      row.appendChild(cell13);
      row.appendChild(cell14);
      tabBody.appendChild(row);
    }
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
      App.populateAuctionTable(result, id);
      }).catch(function(err) {
        console.log("ERROR getting auction info for id: " + id);
        console.log(err.message);
        });
    });
  },

  initAuction: function(provNum, collateralAuction, fileContents) {
    console.log("Auction Init Button Clicked with: " + provNum +  ", " + collateralAuction + "." );
    var auctionExecutorInstance;

    web3.eth.getAccounts(function(error, accounts) {
    if (error) {
      console.log(error);
    }

    //Get input file size in bytes
    input = document.getElementById('filename');
    inputFile = input.files[0];
    //Split inputFile into array of leaves
    var leaves = fileContents.match(/.{1,150}/g);
    console.log("app leaves: " + leaves);
    //Create Merkle Tree and get Root Hex
    var root = createRootHex(leaves);
    console.log(root);

    App.contracts.auctionExecutor.deployed().then(function(instance) {
      auctionExecutorInstance = instance;
    // Return Auction Information
    return auctionExecutorInstance.initAuction(provNum, Math.round(inputFile.size/1024/1024), collateralAuction, root);
    }).then(function(result) {
          alert("File uploaded successfully, auction initiated." )
          console.log("Initiating auction..");
        }).catch(function(err) {
          console.log(err.message);
        });
    });
  },

  bidAuction: function(id, bidValue){
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
      return auctionExecutorInstance.getAuctionInfo(id);
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
          alert("Auction completed, and associated contract has been initiated.");
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
    if (auction[3] != 0 ){
      tabBody=document.getElementById("auctionTableBody");
      row=document.createElement("tr");
      cell0 = document.createElement("td");
      cell1 = document.createElement("td");
      cell2 = document.createElement("td");
      cell3 = document.createElement("td");
      cell4 = document.createElement("td");
      cell5 = document.createElement("td");
      cell6 = document.createElement("td");
      //cell7 = document.createElement("td");
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
      //textnode7=document.createTextNode(App.hex_to_ascii(auction[9]));
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
        if (!state.includes("Completed")){
          console.log("state is: " + state.trim());
          App.completeAuction(id);
        }
        else {
          alert("Auction has already been completed.");
        }
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
      //cell7.appendChild(textnode7);
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
      // row.appendChild(cell7);
      row.appendChild(cell8);
      row.appendChild(cell9);
      row.appendChild(cell10);
      row.appendChild(cell11);
      tabBody.appendChild(row);
    }
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

  formatProofArray(array){
    console.log(array.split(","));
    return array.split(",")
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
    return Math.round(sum);
  },

  tmp(){
    var test = "0x7817bbf23515811db2092dab2ae2a6db0a234df12239e248ae8094ddf152497d";
    console.log(test.toString(16).toUpperCase());
  }


};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

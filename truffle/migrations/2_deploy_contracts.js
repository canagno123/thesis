var HelloWorld2 = artifacts.require("HelloWorld2");
var Proof = artifacts.require("StorageProof");
var Executor = artifacts.require("executorContract");
var Contract = artifacts.require("Contract");

module.exports = function(deployer) {
    	//deployer.deploy(HelloWorld2);
    	//deployer.deploy(Proof);
	deployer.deploy(Executor);
	//deployer.deploy(Contract);
    // Additional contracts can be deployed here
};

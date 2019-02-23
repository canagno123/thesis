var HelloWorld2 = artifacts.require("HelloWorld2");
var Proof = artifacts.require("StorageProof");
var Demo = artifacts.require("demoContract");

module.exports = function(deployer) {
    	//deployer.deploy(HelloWorld2);
    	//deployer.deploy(Proof);
	deployer.deploy(Demo);
    // Additional contracts can be deployed here
};

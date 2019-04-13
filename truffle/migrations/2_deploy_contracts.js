var Proof = artifacts.require("StorageProof");
var Executor = artifacts.require("executorContract");
var Contract = artifacts.require("Contract");

module.exports = function(deployer){
	deployer.deploy(Proof);
	deployer.link(Proof, [Executor, Contract]);
	deployer.deploy(Executor);
	deployer.deploy(Contract, ["0x0000000000000000000000000000000000000000"], "0x0000000000000000000000000000000000000000", 1, 1, 1);
    // Additional contracts can be deployed here
};

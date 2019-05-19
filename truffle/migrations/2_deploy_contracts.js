var Proof = artifacts.require("StorageProof");
var ConEx = artifacts.require("contractExecutor");
var Contract = artifacts.require("Contract");
var Auction = artifacts.require("Auction");
var AuEx = artifacts.require("auctionExecutor");

module.exports = function(deployer){
	deployer.deploy(Proof);
	deployer.link(Proof, [ConEx, Contract]);
	deployer.deploy(ConEx);
	deployer.deploy(AuEx);
	deployer.deploy(Contract, ["0x0000000000000000000000000000000000000000"], "0x0000000000000000000000000000000000000000", web3.utils.asciiToHex("1"), 1, 1);
	deployer.deploy(Auction, "0x0000000000000000000000000000000000000000", 0)
    // Additional contracts can be deployed here
};

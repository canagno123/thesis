var demoContract = artifacts.require("demoContract");
const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const json = require("./../build/contracts/demoContract.json");
const interface = json["abi"];
const bytecode = json["bytecode"];
let accounts;
let contr;
let manager;


contract('demoContract', () =>
{
    it('Should create a contract correctly',async () =>
    {
        demoContract.deployed().then( async instance => {
        await instance.init.call("0xe8012AE4931Aa4a47c00edfB859d5057FC9864c2", "0x631168785E76007f0a2B19f963Efd0F3f8242d00", 1999, 1, 1);
        let providerTest = instance.covenant().rootHash;
        assert.equal(0, providerTest, "The manager is not the provider.");
        })
            //demoContract.deployed().
        //then(instance => instance.init(manager, accounts[1], 1999, 1, 1).send({from: manager}))
    });
});
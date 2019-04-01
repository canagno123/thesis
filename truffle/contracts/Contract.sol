pragma solidity ^0.5.0;

contract Contract{

	address payable public provider;
	address payable public client;
	uint public rootHash;
	uint public collateralAmount; //collateralAmount is stored in wei (10^-19 eth)
	uint public price; //price is stored in wei (10^-19 eth)
	uint public startTime; //startTime is initiated to now in the init function. It is caclulated in seconds since the last Epoch.
	bytes32 public state; //state of the contract

	constructor(address payable _provider, address payable _client, uint _rootHash, uint _collateralAmount, uint _price)
	public
	{
		provider = _provider;
		client = _client;
		rootHash = _rootHash;
		collateralAmount = _collateralAmount;
		price = _price;
		startTime = now;
		state = "Active";
	}

    function setProvider (address payable _provider) 
    public
    {
        provider = _provider;
    }

    function setClient (address payable _client) 
    public
    {
        client = _client;
    }

    function setRootHash (uint _rootHash) 
    public
    {
        rootHash = _rootHash;
    }

    function setCollateralAmount (uint _collateralAmount) 
    public
    {
        collateralAmount = _collateralAmount;
    }

    function setPrice (uint _price) 
    public
    {
        price = _price;
    }

    function setState (bytes32 _state) 
    public
    {
        state = _state;
    }

    function setStartTime (uint _time) 
    public
    {
        startTime = _time;
    }

}
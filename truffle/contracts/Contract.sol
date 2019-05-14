pragma solidity ^0.5.0;

contract Contract{

	address payable[] private provider;
	address payable private client;
	uint private rootHash;
	uint private collateralAmount; //collateralAmount is stored in wei (10^-19 eth)
	uint private price; //price is stored in wei (10^-19 eth)
	uint private startTime; //startTime is initiated to now in the init function. It is caclulated in seconds since the last Epoch.
	uint8 private state; //state of the contract
    //State Constants
    uint8 constant public ACTIVE = 1;
	uint8 constant public INVALID = 2;
	uint8 constant public CANCELED = 3;
	uint8 constant public COMPLETED = 4;

	constructor(address payable[] memory _provider, address payable _client, uint _rootHash, uint _collateralAmount, uint _price)
	public
	{
		provider = _provider;
		client = _client;
		rootHash = _rootHash;
		collateralAmount = _collateralAmount;
		price = _price;
		startTime = now;
		state = ACTIVE;
	}

    function setProvider (address payable[] memory _provider) 
    public
    {
        provider = _provider;
    }

    function getProviders () 
    public
    view
    returns (address  payable[] memory)
    {
        return provider;
    }

    function setClient (address payable _client) 
    public
    {
        client = _client;
    }

    function getClient () 
    public
    view
    returns (address payable _client)
    {
        return client;
    }

    function setRootHash (uint _rootHash) 
    public
    {
        rootHash = _rootHash;
    }

    function getRootHash () 
    public
    view
    returns (uint _rootHash)
    {
        return rootHash;
    }

    function setCollateralAmount (uint _collateralAmount) 
    public
    {
        collateralAmount = _collateralAmount;
    }

    function getCollateralAmount () 
    public
    view
    returns (uint _collateralAmount)
    {
        return collateralAmount;
    }

    function setPrice (uint _price) 
    public
    {
        price = _price;
    }

    function getPrice () 
    public
    view
    returns (uint _price)
    {
        return price;
    }

    function setState (uint8 _state) 
    public
    {
        state = _state;
    }

    function getState () 
    public
    view
    returns (uint8 _state)
    {
        return state;
    }

    function setStartTime (uint _time) 
    public
    {
        startTime = _time;
    }

    function getStartTime () 
    public
    view
    returns (uint _startTime)
    {
        return startTime;
    }

}
pragma solidity ^0.5.0;

contract Auction{

	address payable[] private providersList;
	uint[] private providersPriceList;
    address payable private client;
	uint8 private providersNumber;
	uint private startTime; //startTime is initiated to now in the init function of the auction. It is caclulated in seconds since the last Epoch.
	uint private endTime; //time the auction was completed.
    uint8 private status; //state of the contract
    //Status Constants
    uint8 constant public ONGOING = 1;
	uint8 constant public COMPLETED = 2;

	constructor(address payable _client, uint8 _providersNumber)
	public
	{
		providersList = new address payable[](providersNumber);
        providersPriceList = new uint[](providersNumber);
		client = _client;
		providersNumber = _providersNumber;
		startTime = now;
		status = ONGOING;
	}

    function setProvidersList (address payable[] memory _providersList)
    public
    {
        providersList = _providersList;
    }

    function addProvider (address payable _provider)
    public
    {
        providersList.push(_provider);
    }

    function deleteProvider (uint8 index)
    public
    {
        delete providersList[index];
    }

    function getProvidersList ()
    public
    view
    returns (address payable[] memory _providersList)
    {
        return providersList;
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

    function setProvidersPriceList (uint[] memory _providersPriceList)
    public
    {
        providersPriceList = _providersPriceList;
    }

    function addProvidersPrice (uint _price)
    public
    {
        providersPriceList.push(_price);
    }

    function deleteProvidersPrice (uint8 index)
    public
    {
        delete providersPriceList[index];
    }

    function getProvidersPriceList ()
    public
    view
    returns (uint[] memory _providersPriceList)
    {
        return providersPriceList;
    }

    function setProvidersNumber (uint8 _providersNumber)
    public
    {
        providersNumber = _providersNumber;
    }

    function getProvidersNumber ()
    public
    view
    returns (uint8 _providersNumber)
    {
        return providersNumber;
    }

    function setStatus (uint8 _status)
    public
    {
        status = _status;
    }

    function getStatus ()
    public
    view
    returns (uint8 _status)
    {
        return status;
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

    function setEndTime (uint _time)
    public
    {
        endTime = _time;
    }

    function getEndTime ()
    public
    view
    returns (uint _endTime)
    {
        return endTime;
    }

}
pragma solidity ^0.5.0;

contract ProviderRating{

	mapping(address => uint8) private ratings;
    mapping(address => uint8) private blackList;

    constructor ()
    public
    {}

    function addProvider(address payable _provider)
	public
    returns (bytes32)
	{
        if (!providerExists(_provider) && !providerBlackListed(_provider))
        {
		    ratings[_provider] = 3;
            return "OK";
        }
        else if (providerExists(_provider))
            return "Exists";
        else if (providerBlackListed(_provider))
            return "BlackListed";
    }

    function providerExists(address payable _provider)
    public
    view
    returns (bool)
    {
        return ratings[_provider] != uint8(0x0);
    }

    function providerBlackListed(address payable _provider)
    public
    view
    returns (bool)
    {
        return blackList[_provider] != uint8(0x0);
    }

    function levelUpRating (address payable _provider)
    public
    {
        if (ratings[_provider] < 5)
            ratings[_provider]++;
    }

    function levelDownRating (address payable _provider)
    public
    {
        if (ratings[_provider] > 0)
            ratings[_provider]--;
        else
        {
            delete ratings[_provider];
            blackList[_provider] = 1;
        }
    }

    function getRating (address payable _provider)
    public
    view
    returns (uint8 _rating)
    {
        return ratings[_provider];
    }
}
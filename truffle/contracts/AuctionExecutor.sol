pragma solidity ^0.5.0;
import "./Auction.sol";
import "./ProviderRating.sol";

contract auctionExecutor{

	//Data Structures and id counter
	uint private id = 0;
	mapping(uint => Auction) public auctions;
    ProviderRating ratings;

    //Status Constants
    uint8 constant public ONGOING = 1;
	uint8 constant public COMPLETED = 2;

    constructor (ProviderRating _rating)
    public
    {
        ratings = _rating;
    }

	function initAuction(uint8 _providersNumber, uint8 tempFileSize, uint tempCollateralAmount, bytes32 tempRootHash)
	public
	payable
	returns (bytes32 initMessage)
	{
        auctions[id] = new Auction(msg.sender, _providersNumber, tempFileSize, tempRootHash, tempCollateralAmount);
		id++;
		return "Initialization successfull.";
	}

	function getAuctionInfo(uint _id)
	public
    view
	returns(address payable[] memory tempProvider, address payable tempClient, uint[] memory tempPrice, uint8 tempProvidersNumber, uint tempStartTime,
            uint tempEndTime, bytes32 tempStatus, uint8 tempFileSize, uint tempCollateralAmount, bytes32 tempRootHash, bytes32 infoMessage)
	{
		tempProvider = auctions[_id].getProvidersList();
        tempClient = auctions[_id].getClient();
		tempStartTime = auctions[_id].getStartTime();
		tempPrice = auctions[_id].getProvidersPriceList();
		tempEndTime = auctions[_id].getEndTime();
		tempProvidersNumber = auctions[_id].getProvidersNumber();
        tempFileSize = auctions[_id].getFileSize();
        tempCollateralAmount = auctions[_id].getCollateralAmount();
        tempRootHash = auctions[_id].getRootHash();
		tempStatus = returnStringStatus(auctions[_id].getStatus());
		infoMessage = "OK";
	}

	function bid(uint _id)
	public
	payable
    onlyOngoing(_id)
    onlyNotOwner(_id)
    onlyOverZeroEth()
    notBlackListed()
    notExists(_id)
	returns(bytes32 bidMessage)
	{
        if (!ratings.providerExists(msg.sender))
            ratings.addProvider(msg.sender);
        address payable[] memory provs = auctions[_id].getProvidersList();
        uint[] memory prices = auctions[_id].getProvidersPriceList();
        uint8 desiredNumber = auctions[_id].getProvidersNumber();
        if (prices.length < desiredNumber){
            auctions[_id].addProvider(msg.sender);
            auctions[_id].addProvidersPrice(msg.value);
            return "Success";
        }
        uint max = 0;
        uint8 maxi = 0;
        for (uint8 i = 0; i < prices.length; i++)
        {
            if(prices[i] >= max){
                max = prices[i];
                maxi = i;
            }
        }
        if (msg.value < max ){
            provs[maxi].transfer(prices[maxi]);
            auctions[_id].deleteProvider(maxi);
            auctions[_id].deleteProvidersPrice(maxi);
            auctions[_id].addProvider(msg.sender);
            auctions[_id].addProvidersPrice(msg.value);
            return "Provider list altered.";
        }
        else if (msg.value == max)
        {
            if (ratings.getRating(provs[maxi]) < ratings.getRating(msg.sender))
            {
                provs[maxi].transfer(prices[maxi]);
                auctions[_id].deleteProvider(maxi);
                auctions[_id].deleteProvidersPrice(maxi);
                auctions[_id].addProvider(msg.sender);
                auctions[_id].addProvidersPrice(msg.value);
                return "Provider list altered.";
            }
        }
        else {
            revert("Bid not high enough");
        }
	}

    function completeAuction(uint _id)
    public
    onlyOwner(_id)
    returns (bytes32)
    {
        auctions[_id].setStatus(COMPLETED);
        auctions[_id].setEndTime(now);
        return "Auction completed";
    }

	//Function that makes the contract able to accept payments
	function () external payable {

	}

    //Modifiers
    modifier onlyOngoing(uint __id) {
        if (auctions[__id].getStatus() == COMPLETED) revert("Auction is completed");
        _;
    }
    modifier onlyNotOwner(uint __id) {
        if (msg.sender == auctions[__id].getClient()) revert("Client cannot bid.");
        _;
    }
    modifier onlyOwner(uint __id) {
        if (msg.sender != auctions[__id].getClient()) revert("Only the client can complete the auction.");
        _;
    }
    modifier onlyOverZeroEth(){
        if (msg.value <= 0) revert("Payments should be over 0 ETH.");
        _;
    }
    modifier bidderNotBlackListed(){
        if (msg.value <= 0) revert("Payments should be over 0 ETH.");
        _;
    }
    modifier notBlackListed(){
        if (ratings.providerBlackListed(msg.sender)) revert("Bidder is blacklisted.");
        _;
    }
    modifier notExists(uint _id){
        address payable[] memory provs = auctions[_id].getProvidersList();
        for (uint8 i = 0; i < provs.length; i++)
        {
            if(provs[i] == msg.sender){
                revert("Bidder is already in the providers' list.");
            }
        }
        _;
    }

    function returnStringStatus(uint8 _id)
    public
    pure
    returns(bytes32)
    {
        if (_id == 1)
            return "Ongoing";
        else if (_id == 2)
            return "Completed";
        else
            return "Status id is not valid";
    }
}
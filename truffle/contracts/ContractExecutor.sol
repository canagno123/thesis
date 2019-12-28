pragma solidity ^0.5.0;
import "./Contract.sol";
import "./storage-proof.sol";
import "./ProviderRating.sol";


contract contractExecutor{

	//Data Structures and id counter
	uint private id = 0;
	mapping(uint => Contract) public contracts;
	mapping(uint => uint) public paymentTime;
	mapping(uint => string) public leafToVerify;
	mapping(uint => uint) verifications;
    ProviderRating ratings;
	event setLeafEvent(uint _id, string _leaf);

	//State Constants
	uint8 constant public ACTIVE = 1;
	uint8 constant public INVALID = 2;
	uint8 constant public CANCELED = 3;
	uint8 constant public COMPLETED = 4;

	constructor (ProviderRating _rating)
    public
    {
        ratings = _rating;
    }

	function initContract(address payable[] memory provider, address payable client, bytes32 rootHash, uint collateralAmount, uint price)
	public
	payable
	onlyIfCollateral(collateralAmount)
	returns (bytes32 initMessage)
	{
			contracts[id] = new Contract(provider, client, rootHash, collateralAmount, price);
			for (uint i = 0; i < provider.length; i++){
				if (ratings.providerBlackListed(provider[i]))
				{
					revert("One of the providers is blacklisted.");
				}
				verifications[id] = now;
			}
			paymentTime[id] = now;
			leafToVerify[id] = "";
			id++;
			initMessage = "Initialization successfull.";
	}

	function getContractInfo(uint _id)
	public
	view
	returns(address payable[] memory tempProvider, address payable tempClient, uint tempPrice, bytes32 infoMessage, uint tempCollateral, uint tempTime, uint temppTime, bytes32 tempState, bytes32 tempRoot)
	{
		if (contracts[_id].getClient() != 0x0000000000000000000000000000000000000000){
			tempProvider = contracts[_id].getProviders();
			tempClient = contracts[_id].getClient();
			tempTime = contracts[_id].getStartTime();
			tempPrice = contracts[_id].getPrice();
			temppTime = paymentTime[_id];
			tempCollateral = contracts[_id].getCollateralAmount();
			tempState = returnStringStatus(contracts[_id].getState());
			tempRoot = contracts[_id].getRootHash();
			infoMessage = "OK";
		}
		else
		{
			if (contracts[_id].getState() == INVALID)
			{
				tempProvider = contracts[_id].getProviders();
				tempClient = contracts[_id].getClient();
				tempTime = contracts[_id].getStartTime();
				tempPrice = contracts[_id].getPrice();
				temppTime = paymentTime[_id];
				tempState = returnStringStatus(contracts[_id].getState());
				infoMessage = "Not enough funds.";
			}
			else
			{
				tempProvider = contracts[_id].getProviders();
				tempClient = contracts[_id].getClient();
				tempTime = contracts[_id].getStartTime();
				tempPrice = contracts[_id].getPrice();
				temppTime = paymentTime[_id];
				tempState = returnStringStatus(contracts[_id].getState());
				infoMessage = "No Contract initialized.";
			}
		}
	}

	function pay(uint _id)
	public
	payable
	onlyClient(_id)
	onlyActiveOrInvalid(_id)
	onlyAfterOneMonth(_id)
	onlyRightPrice(_id)
	returns(bytes32 paymentMessage)
	{
		address payable[] memory provs = contracts[_id].getProviders();
		for (uint i = 0; i < provs.length; i++)
		{
			address payable currProv = provs[i];
			uint providerBalance = currProv.balance;
			currProv.transfer(msg.value / provs.length);
			if (currProv.balance >= providerBalance + (contracts[_id].getPrice() / provs.length)){
					paymentTime[_id] = now;//If the payment is successfull, set the payment time to now.
					paymentMessage = "Payment successfull.";
			}
			else {
				contracts[_id].setState(INVALID);
				revert("Transaction failed");
			}
		}
	}

	function getVerification(uint _id, bytes32[] memory _proof)
	public
	returns(bytes32 verificationMessage)
	{
		if (keccak256(abi.encodePacked(leafToVerify[_id])) != keccak256(abi.encodePacked(""))){
			if (StorageProof.verify2(contracts[_id].getRootHash(), leafToVerify[_id], _proof)){
				leafToVerify[_id] = "";
				verifications[_id] = now;
				verificationMessage = "OK";
			}
			else{
				terminateCulpProvider(_id);
				verificationMessage = "NOK";
			}
		}
		else
			revert("No leaf specified.");
	}

	function terminateCulpClient(uint _id)
	public
	payable
	onlyMoreThanOneMonth(_id)
	returns(bytes32 terminationMessage)
	{
		contracts[_id].setState(CANCELED);
		address payable[] memory provs = contracts[_id].getProviders();
		uint coll = contracts[_id].getCollateralAmount();
		for (uint i = 0; i < provs.length; i++){
			//Level up the providers' rating
			ratings.levelUpRating(provs[i]);
			provs[i].transfer(coll / provs.length);
		}
		invalidateContract(_id);
		return "OK";
	}

	function terminateCulpProvider(uint _id)
	public
	payable
	returns(bytes32 terminationMessage)
	{
		contracts[_id].setState(CANCELED);
		address payable[] memory provs = contracts[_id].getProviders();
		uint coll = contracts[_id].getCollateralAmount();
		//Level down culpable provider's rating
		for (uint i = 0; i < provs.length; i++){
			ratings.levelDownRating(provs[i]);
		}
		address(contracts[_id].getClient()).transfer(coll / (provs.length));
		invalidateContract(_id);
		return "OK";
	}

	function terminateMutual(uint _id)
	public
	payable
	onlyLessThanHalfMonth(_id)
	returns(bytes32 terminationMessage)
	{
		contracts[_id].setState(COMPLETED);
		address payable[] memory provs = contracts[_id].getProviders();
		uint coll = contracts[_id].getCollateralAmount();
		uint splitCount = provs.length + 1;
		for (uint i = 0; i < provs.length; i++){
			if (true){
				provs[i].transfer(coll / splitCount);
				//Level up provider's rating
				ratings.levelUpRating(provs[i]);
			}
			else{
				//Level down provider's rating
				ratings.levelDownRating(provs[i]);
				splitCount--;
			}
		}
		address(contracts[_id].getClient()).transfer(coll / splitCount);
		terminationMessage = "OK";
		invalidateContract(_id);
	}

	function timeDif(uint _id)
	public
	view
	returns(uint256)
	{
		uint256 duration = now - paymentTime[_id];
		return duration;
	}

	function invalidateContract(uint _id)
	public
	{
		contracts[_id].setClient(0x0000000000000000000000000000000000000000);
	}

	function getLeaf(uint _id)
	public
	view
	returns (string memory)
	{
		return leafToVerify[_id];
	}

	function setLeaf(uint _id, string memory _leaf)
	public
	onlyClient(_id)
	{
		leafToVerify[_id] = _leaf;
		emit setLeafEvent(_id, _leaf);
	}

	//Function that makes the contract able to accept payments
	function () external payable {

	}

	//Modifiers
	modifier onlyActiveOrInvalid(uint _id){
		if (contracts[_id].getState() != ACTIVE && contracts[_id].getState() != INVALID) revert("Contract is terminated.");
        _;
	}
	modifier onlyAfterOneMonth(uint _id){
		if (timeDif(_id) < 30) revert("Payments are made every 1 month.");
        _;
	}
	modifier onlyRightPrice(uint _id){
		if(msg.value != contracts[_id].getPrice() * 1 wei) {
			contracts[_id].setState(INVALID);
			revert("Insufficient or excessive amount");
		}
		_;
	}
	modifier onlyIfCollateral(uint coll){
		if (msg.value != coll * 1 wei) revert("Insufficient or excessive collateral amount");
		_;
	}
	modifier onlyLessThanHalfMonth(uint _id){
		if (timeDif(_id) > 15) revert("Contract can be mutually terminated before hald a month has passed since last payment.");
		_;
	}
	modifier onlyMoreThanOneMonth(uint _id){
		if (timeDif(_id) <= 2629743)
			revert("Contract can be terminated with the client culpable only if more than one month has passed since last payment.");
		_;
	}
	modifier onlyNotVerified(uint _id, string memory _leaf, bytes32[] memory _proof){
		if (StorageProof.verify2(contracts[_id].getRootHash(), _leaf, _proof)) revert("Merkle Proof was verified.");
		_;
	}
	modifier onlyClient(uint _id){
		if (msg.sender != contracts[_id].getClient()) revert("Only the client can access this method.");
        _;
	}

	function returnStringStatus(uint8 _id)
    public
    pure
    returns(bytes32)
    {
        if (_id == 1)
            return "Active";
        else if (_id == 2)
            return "Invalid";
        else if (_id == 3)
            return "Cancelled";
		else if (_id == 4)
            return "Completed";
		else
            return "Status id is not valid";
    }

	function getContractStatuses()
	public
	view
	returns(uint8[20] memory)
	{
		uint8[20] memory returnList;
		for (uint i = 0; i < 20; i++){
			if (i > id - 1)
				break;
			returnList[i] = contracts[i].getState();
		}
		return returnList;
	}

}
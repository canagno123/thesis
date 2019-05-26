pragma solidity ^0.5.0;
import "./Contract.sol";
import "./storage-proof.sol";

contract contractExecutor{

	//Data Structures and id counter
	uint private id = 0;
	mapping(uint => Contract) public contracts;
	mapping(uint => uint) public paymentTime;
	mapping(uint => mapping(address => uint)) verifications;

	//State Constants
	uint8 constant public ACTIVE = 1;
	uint8 constant public INVALID = 2;
	uint8 constant public CANCELED = 3;
	uint8 constant public COMPLETED = 4;

	function initContract(address payable[] memory provider, address payable client, bytes32 rootHash, uint collateralAmount, uint price)
	public
	payable
	onlyIfCollateral(collateralAmount)
	returns (bytes32 initMessage)
	{
		if (msg.value == collateralAmount * 1 wei){
			contracts[id] = new Contract(provider, client, rootHash, collateralAmount, price);
			for (uint i = 0; i < provider.length; i++){
				verifications[id][provider[i]] = now;
			}
			paymentTime[id] = now;
			id++;
			initMessage = "Initialization successfull.";
		}
		else {
			revert("Insufficient or excessive amount");
		}
	}

	function getContractInfo(uint _id)
	public
	view
	returns(address payable[] memory tempProvider,uint tempPrice, bytes32 infoMessage, uint tempCollateral, uint tempTime, uint temppTime, uint8 tempState)
	{
		if (contracts[_id].getClient() != 0x0000000000000000000000000000000000000000){
			tempProvider = contracts[_id].getProviders();
			tempTime = contracts[_id].getStartTime();
			tempPrice = contracts[_id].getPrice();
			temppTime = paymentTime[_id];
			tempCollateral = contracts[_id].getCollateralAmount();
			tempState = contracts[_id].getState();
			infoMessage = "OK";
		}
		else
		{
			if (contracts[_id].getState() == INVALID)
			{
				tempProvider = contracts[_id].getProviders();
				tempTime = contracts[_id].getStartTime();
				tempPrice = contracts[_id].getPrice();
				temppTime = paymentTime[_id];
				tempState = contracts[_id].getState();
				infoMessage = "Not enough funds.";
			}
			else
			{
				tempProvider = contracts[_id].getProviders();
				tempTime = contracts[_id].getStartTime();
				tempPrice = contracts[_id].getPrice();
				temppTime = paymentTime[_id];
				tempState = contracts[_id].getState();
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

	function getVerification(uint _id, address payable _provider, bytes memory _leaf, bytes32[] memory _nodeHashes, bool[] memory _nodeOrientations)
	public
	returns(bytes32 verificationMessage)
	{
		if (StorageProof.verify(contracts[_id].getRootHash(), _leaf, _nodeHashes, _nodeOrientations)){
			verifications[_id][_provider] = now;
			verificationMessage = "OK";
		}
		else{
			terminateCulpProvider(_id, _provider,  _leaf, _nodeHashes, _nodeOrientations);
			verificationMessage = "NOK";
		}
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
			provs[i].transfer(coll / provs.length);
		}
		invalidateContract(_id);
		return "OK";
	}

	function terminateCulpProvider(uint _id, address payable _provider, bytes memory _leaf,
								   bytes32[] memory _nodeHashes, bool[] memory _nodeOrientations)
	public
	payable
	onlyNotVerified(_id, _leaf, _nodeHashes, _nodeOrientations)
	returns(bytes32 terminationMessage)
	{
		contracts[_id].setState(CANCELED);
		address payable[] memory provs = contracts[_id].getProviders();
		uint coll = contracts[_id].getCollateralAmount();
		for (uint i = 0; i < provs.length; i++){
			if (provs[i] != _provider){
				provs[i].transfer(coll / (provs.length));
			}
			address(contracts[_id].getClient()).transfer(coll / (provs.length));
		}
		invalidateContract(_id);
		return "OK";
	}

	function terminateMutual(uint _id, bytes memory _leaf, bytes32[] memory _nodeHashes, bool[] memory _nodeOrientations)
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
			if (StorageProof.verify(contracts[_id].getRootHash(), _leaf, _nodeHashes, _nodeOrientations)){
				provs[i].transfer(coll / splitCount);
			}
			else{
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
		delete contracts[_id];
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
		if (timeDif(_id) < 2629743) revert("Payments are made every 1 month.");
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
		if (timeDif(_id) > 1314871) revert("Contract can be mutually terminated before hald a month has passed since last payment.");
		_;
	}
	modifier onlyMoreThanOneMonth(uint _id){
		if (timeDif(_id) <= 2629743)
			revert("Contract can be terminated with the client culpable only if more than one month has passed since last payment.");
		_;
	}
	modifier onlyNotVerified(uint _id, bytes memory _leaf, bytes32[] memory _nodeHashes, bool[] memory _nodeOrientations){
		if (StorageProof.verify(contracts[_id].getRootHash(), _leaf, _nodeHashes, _nodeOrientations)) revert("Merkle Proof was verified.");
		_;
	}
	modifier onlyClient(uint _id){
		if (msg.sender != contracts[_id].getClient()) revert("Only the client can pay the contract.");
        _;
	}

}
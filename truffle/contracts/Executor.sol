pragma solidity ^0.5.0;
import "./Contract.sol";
import "./storage-proof.sol";

contract executorContract{

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
	
	function init(address payable[] memory provider, address payable client, uint rootHash, uint collateralAmount, uint price)
	public
	payable
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
			initMessage = "Insufficient or excessive amount";
			revert();
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
			else{
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
	returns(bytes32 paymentMessage)
	{
		if (contracts[_id].getState() == ACTIVE || contracts[_id].getState() == INVALID)
		{
			if (timeDif(_id) >= 2629743) //Check if 1 month has passed since last payment or the creation of the contract
			{
				if(msg.value == contracts[_id].getPrice() * 1 wei){
					address payable[] memory provs = contracts[_id].getProviders();
					for (uint i=0; i < provs.length; i++){
						address payable currProv = provs[i];
						uint providerBalance = currProv.balance;
						currProv.transfer(msg.value / provs.length);
						if (currProv.balance >= providerBalance + (contracts[_id].getPrice() / provs.length)){
							paymentTime[_id] = now; //If the payment is successfull, set the payment time to now.
							paymentMessage = "Payment successfull.";
						}
						else {
							contracts[_id].setState(INVALID);
							paymentMessage = "Transaction failed";
							revert();
						}
					}
				}
				else{
					contracts[_id].setState(INVALID);
					paymentMessage = "Insufficient or excessive amount";
					revert();
				}
		 	}
			else
			{
				paymentMessage = "Payments are made every 1 month.";
				revert();
			}
		}
		else
		{
			paymentMessage = "Contract is terminated.";
			revert();
		}
	}

	function getVerification(uint _id, address payable _provider/*, bytes memory _leaf, bytes32[] memory _nodeHashes, bool[] memory _nodeOrientations*/)
	public
	returns(bytes32 verificationMessage)
	{
		if (/* && verify(contracts[_id].rootHash(), _leaf, _nodeHashes, _nodeOrientations)*/ true){
			verifications[_id][_provider] = now;
			verificationMessage = "OK";
		}
		else{
			terminateCulpProvider(_id, _provider/*, bytes memory _leaf, bytes32[] memory _nodeHashes, bool[] memory _nodeOrientations*/);
			verificationMessage = "NOK";
		}
	}

	function terminateCulpClient(uint _id/*, bytes memory _leaf, bytes32[] memory _nodeHashes, bool[] memory _nodeOrientations*/) 
	public
	payable
	returns(bytes32 terminationMessage)
	{
		if (timeDif(_id) > 2629743) 
		{
			contracts[_id].setState(CANCELED);
			address payable[] memory provs = contracts[_id].getProviders();
			for (uint i = 0; i < provs.length; i++){
				provs[i].transfer(contracts[_id].getCollateralAmount()/provs.length);
			}
		}
		else
		{
			terminationMessage = "NOK";
		}
		invalidateContract(_id);
		return "OK";
	}

	function terminateCulpProvider(uint _id, address payable _provider/*, bytes memory _leaf, bytes32[] memory _nodeHashes, bool[] memory _nodeOrientations*/) 
	public
	payable
	returns(bytes32 terminationMessage)
	{
		if (/* && verify(contracts[_id].rootHash(), _leaf, _nodeHashes, _nodeOrientations)*/ true){
			terminationMessage = "NOK";
		}
		else{
			contracts[_id].setState(CANCELED);
			address payable[] memory provs = contracts[_id].getProviders();
			for (uint i = 0; i < provs.length; i++){
				if (provs[i] != _provider){	
					provs[i].transfer(contracts[_id].getCollateralAmount()/(provs.length));
				}
				address(contracts[_id].getClient()).transfer(contracts[_id].getCollateralAmount()/(provs.length));
			}
			invalidateContract(_id);
			return "OK";
		}
	}	

	function terminateMutual(uint _id/*, bytes memory _leaf, bytes32[] memory _nodeHashes, bool[] memory _nodeOrientations*/) 
	public
	payable
	returns(bytes32 terminationMessage)
	{
		if (timeDif(_id) <= 1314871){
			contracts[_id].setState(COMPLETED);
			address payable[] memory provs = contracts[_id].getProviders();
			uint splitCount = provs.length + 1;
			for (uint i = 0; i < provs.length; i++){
				if (/* verify(contracts[_id].rootHash(), _leaf, _nodeHashes, _nodeOrientations)*/true){
					provs[i].transfer(contracts[_id].getCollateralAmount()/splitCount);
				}
				else{
					splitCount--;
				}
			}
			address(contracts[_id].getClient()).transfer(contracts[_id].getCollateralAmount()/splitCount);
			terminationMessage = "OK";
			invalidateContract(_id);
		}
		else {
			return "NOK";
		}
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

	// Function that makes the contract able to accept payments
	function () external payable {

	}
}

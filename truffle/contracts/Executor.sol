pragma solidity ^0.5.0;
//pragma experimental ABIEncoderV2; //Need to be specified so that functions can return structs. Not necessary, will be removed after testing phase.
import "./Contract.sol";
import "./storage-proof.sol";

contract executorContract{

	uint private id = 0; //May need id for multiple contracts between multiple parties
	mapping(uint => Contract) public contracts;
	mapping(uint => uint) public paymentTime;


	function init(address payable[] memory provider, address payable client, uint rootHash, uint collateralAmount, uint price)
	public
	payable
	returns (bytes32 initMessage)
	{
		if (msg.value == collateralAmount * 1 wei){
			contracts[id] = new Contract(provider, client, rootHash, collateralAmount, price);
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
		if (contracts[_id].client() != 0x0000000000000000000000000000000000000000){
			tempProvider = contracts[_id].getProviders();
			tempTime = contracts[_id].startTime();
			tempPrice = contracts[_id].price();
			temppTime = paymentTime[_id];
			tempCollateral = contracts[_id].collateralAmount();
			tempState = contracts[_id].state();
			infoMessage = "OK";
		}
		else 
		{
			if (contracts[_id].state() == 2)
			{
				tempProvider = contracts[_id].getProviders();
				tempTime = contracts[_id].startTime();
				tempPrice = contracts[_id].price();
				temppTime = paymentTime[_id];
				tempState = contracts[_id].state();
				infoMessage = "Not enough funds.";
			}
			else{
				tempProvider = contracts[_id].getProviders();
				tempTime = contracts[_id].startTime();
				tempPrice = contracts[_id].price();
				temppTime = paymentTime[_id];
				tempState = contracts[_id].state();
				infoMessage = "No Contract initialized.";
			}
		}
	}

	function pay(uint _id)
	public
	payable
	returns(bytes32 paymentMessage)
	{
		if (contracts[_id].state() == 1 || contracts[_id].state() == 2)
		{
			if (timeDif(_id) >= 2629743) //Check if 1 month has passed since last payment or the creation of the contract
			{
				if(msg.value == contracts[_id].price() * 1 wei){
					address payable[] memory provs = contracts[_id].getProviders();
					for (uint i=0; i < provs.length; i++){
						address payable currProv = provs[i];
						uint providerBalance = currProv.balance;
						currProv.transfer(msg.value / provs.length);
						if (currProv.balance >= providerBalance + (contracts[_id].price() / provs.length)){
							paymentTime[_id] = now; //If the payment is successfull, set the payment time to now.
							paymentMessage = "Payment successfull.";
						}
						else {
							contracts[_id].setState(2);
							paymentMessage = "Transaction failed";
							revert();
						}
					}
				}
				else{
					contracts[_id].setState(2);
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

	function terminate(uint _id, bytes32 _culpable/*, bytes memory _leaf, bytes32[] memory _nodeHashes, bool[] memory _nodeOrientations*/) 
	public
	payable
	returns(bytes32 terminationMessage)
	{
		if (_culpable == "CLIENT"  && timeDif(_id) > 2629743) 
		{
			contracts[_id].setState(3);
			address payable[] memory provs = contracts[_id].getProviders();
			for (uint i = 0; i < provs.length; i++){
				provs[i].transfer(contracts[_id].collateralAmount()/provs.length);
			}
		}
		else if (_culpable == "PROVIDER" /*&& verify(contracts[_id].rootHash(), _leaf, _nodeHashes, _nodeOrientations)*/)
		{
			contracts[_id].setState(3);
			address(contracts[_id].client()).transfer(contracts[_id].collateralAmount());
		}
		else if (_culpable == "" && timeDif(_id) <= 1314871 /*&& verify(contracts[_id].rootHash(), _leaf, _nodeHashes, _nodeOrientations)*/) 
		{
			contracts[_id].setState(4);
			address payable[] memory provs = contracts[_id].getProviders();
			for (uint i = 0; i < provs.length; i++){
				provs[i].transfer(contracts[_id].collateralAmount()/(provs.length + 1));
			}
			address(contracts[_id].client()).transfer(contracts[_id].collateralAmount()/(provs.length + 1));
		}
		else
		{
			return "NOK";
		}
		invalidateContract(_id);
		return "OK";
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
		address payable[] memory emptyArray;
		contracts[_id].setProvider(emptyArray);
		contracts[_id].setClient(0x0000000000000000000000000000000000000000);
		contracts[_id].setRootHash(0);
		contracts[_id].setPrice(0);
		contracts[_id].setCollateralAmount(0);
		contracts[_id].setStartTime(0);
		delete contracts[_id];
	}

	// Function that makes the contract able to accept payments
	function () external payable {

	}

}

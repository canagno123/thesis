pragma solidity ^0.5.0;
//pragma experimental ABIEncoderV2; //Need to be specified so that functions can return structs. Not necessary, will be removed after testing phase.
import "./Contract.sol";

contract executorContract{

	uint private id = 0; //May need id for multiple contracts between multiple parties
	mapping(uint => Contract) public contracts;
	mapping(uint => uint) public paymentTime;
	address contractAddress = address(this);

	/* Function that initiates a contract between a client and a provider, with all the information
	** specified.
	*/
	function init(address payable provider, address payable client, uint rootHash, uint collateralAmount, uint price)
	public
	returns (bytes32 initMessage)
	{
		contracts[id] = new Contract(provider, client, rootHash, collateralAmount, price);
		paymentTime[id] = now;
		id++;
		initMessage = "Initialization successfull.";
	}

	/* Function that returns all the information about the contract,
	** if one is initialized.
	*/
	function getContractInfo(uint _id)
	public
	view
	returns(address payable tempProvider,uint tempPrice, bytes32 infoMessage, uint tempTime, uint temppTime, bytes32 tempState)
	{
		if (contracts[_id].provider() != 0x0000000000000000000000000000000000000000){
			tempProvider = contracts[_id].provider();
			tempTime = contracts[_id].startTime();
			tempPrice = contracts[_id].price();
			temppTime = paymentTime[_id];
			tempState = contracts[_id].state();
			infoMessage = "OK";
		}
		else 
		{
			if (contracts[_id].state() == "Invalid")
			{
				tempProvider = contracts[_id].provider();
				tempTime = contracts[_id].startTime();
				tempPrice = contracts[_id].price();
				temppTime = paymentTime[_id];
				tempState = contracts[_id].state();
				infoMessage = "Not enough funds.";
			}
			else{
				tempProvider = contracts[_id].provider();
				tempTime = contracts[_id].startTime();
				tempPrice = contracts[_id].price();
				temppTime = paymentTime[_id];
				tempState = contracts[_id].state();
				infoMessage = "No Contract initialized.";
			}
		}
	}

	/* Function called by the client to pay the specified price in the contract. The payment is being made to the contract, which then transfers the amount to
	*  the provider. The contract needs to either be Active or Invalid, and 1 month must have passed since the last payment.
	*/
	function pay(uint _id)
	public
	payable
	returns(bytes32 paymentMessage)
	{

		if (contracts[_id].state() == "Active" || contracts[_id].state() == "Invalid")
		{
			if (timeDif(_id) >= 2629743) //Check if 1 month has passed since last payment or the creation of the contract
			{
				require(msg.value == contracts[_id].price());
				uint providerBalance = address(contracts[_id].provider()).balance;
				(contracts[_id].provider()).transfer(msg.value);
		 		if (address(contracts[_id].provider()).balance >= providerBalance + contracts[_id].price()) paymentTime[_id] = now; //If the payment is successfull, set the payment time to now.
		 		else {
					contracts[_id].setState("Invalid");
					return "Transaction failed";
				}	 
		 	}
			else
			{
				paymentMessage = "Payments are made every 1 month.";
			}
			paymentMessage = "Payment completed.";
		}
		else
		{
			paymentMessage = "Contract is terminated.";
		}
	}


	/* Function that terminates the contract. Half of the collateral amount specified in the
	** contract is return to the not culpable party if there is one. If the termination is mutual,
	** both parties take their Ether back. Finally, the contract is invalidated.
	*/
	function terminate(uint _id, bytes32 culpable) 
	public
	payable
	{
		if (culpable == "CLIENT") 
		{
			contracts[_id].setState("Cancelled");
			address(contracts[_id].provider()).transfer(contracts[_id].collateralAmount()/2);
		}
		else if (culpable == "PROVIDER")
		{
			contracts[_id].setState("Cancelled");
			address(contracts[_id].client()).transfer(contracts[_id].collateralAmount()/2);
		}
		else 
		{
			contracts[_id].setState("Completed");
			address(contracts[_id].provider()).transfer(contracts[_id].collateralAmount()/2);
			address(contracts[_id].client()).transfer(contracts[_id].collateralAmount()/2);
		}
		invalidateContract(_id);
		address(0x0000000000000000000000000000000000000000).transfer(contractAddress.balance); //Burn contract's ether and delete struct entry representing the covenant.
	}

	/* Function that calculates the time (in seconds) passed
	** since the last payment time for the specified contract.
	*/
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
		contracts[_id].setProvider(0x0000000000000000000000000000000000000000);
		contracts[_id].setClient(0x0000000000000000000000000000000000000000);
		contracts[_id].setRootHash(0);
		contracts[_id].setPrice(0);
		contracts[_id].setCollateralAmount(0);
		contracts[_id].setStartTime(0);
	}

	// Function that makes the contract able to accept payments
	function () external payable {

	}

}

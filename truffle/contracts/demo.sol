pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2; //Need to be specified so that functions can return structs. Not necessary, will be removed after testing phase.


contract demoContract{

	//Struct representing the contract
	struct Contract{
		//uint id;
		address payable provider;
		address payable client;
		uint rootHash;
		uint collateralAmount;
		uint price;
		uint startTime;
	}

	address contractAddress = address(this);
	Contract public covenant;

	/* Function that initiates a contract between a client and a provider, with all the information
	** specified. For the contract to be successfully initiated, the collateral amount specified in
	** in the arguments of the call must be first transferred to the contract's address.
	*/
	function init(address payable provider, address payable client, uint rootHash, uint collateralAmount, uint price)
	public
	returns (bytes32 initMessage)
	{
		if (contractAddress.balance >= collateralAmount) //Will be uncommented for finalised edition
		//if (address(msg.sender).balance >= collateralAmount) //For testing purposes.
		{
			covenant = Contract(provider, client, rootHash, collateralAmount, price, now);
			initMessage = "Initialization successfull.";
		}
		else
		{
			initMessage = "Initialization failed.";
		}
		
	}

	/* Function that returns all the information about the contract,
	** if one is initialized.
	*/
	function getContractInfo()
	public
	view
	returns(Contract memory tempCovenant, bytes32 infoMessage, uint contractBalance)
	{
		contractBalance = contractAddress.balance;
		if (covenant.provider != 0x0000000000000000000000000000000000000000){
			tempCovenant = covenant;
			infoMessage = "OK";
		}
		else 
		{
			tempCovenant = covenant;
			infoMessage = "No Contract initialized.";
		}
	}

	/* Function called by the provider to complete his payment. IN order for the payment to be successfuly
	** completed, there should be at least one month passed from the last payment or the creation of the contract.
	** Additionally, the successfull completion of the payment, requires that the client has transferred the aggreed
	** price to the contract's address. 
	*/
	function pay()
	public
	payable
	returns(bytes32 paymentMessage)
	{
		 if (timeDif() >= 100) //Check if 1 month has passed since last payment or the creation of the contract
		 {
		 	if (clientPaid()) //Check if client has paid the aggreed price
		 	{
		 		uint providerBalance = address(covenant.provider).balance;
		 		// address(covenant.provider).transfer(covenant.price); //Will remain in comment for the function to be compiled with the view keyword
		 		//providerBalance += covenant.price; //For testing purposes.
		 		if (address(covenant.provider).balance >= providerBalance + covenant.price) covenant.startTime = now; //If the payment is successfull, change the startTime of the contract to now.
		 		else return "Transaction failed";
		 	}
		 	else
		 	{
		 		paymentMessage = "Client has not paid.";
		 		terminate("CLIENT");
			}
		 }
		 else
		 {
		 	paymentMessage = "Payments are made every 1 month.";
		 }
		 paymentMessage = "Payment completed.";
	}


	/* Function that terminates the contract. Half of the collateral amount specified in the
	** contract is return to the not culpable party if there is one. If the termination is mutual,
	** both parties take their Ether back. Finally, the contract is self destroyed and any remaining 
	** Ether is burned.
	*/
	function terminate(bytes32 culpable) 
	public
	payable
	{
		if (culpable == "CLIENT") address(covenant.provider).transfer(covenant.collateralAmount/2);
		else if (culpable == "PROVIDER") address(covenant.client).transfer(covenant.collateralAmount/2);
		else 
		{
			address(covenant.provider).transfer(covenant.collateralAmount/2);
			address(covenant.client).transfer(covenant.collateralAmount/2);
		}
		selfdestruct(0x0000000000000000000000000000000000000000); //Selfdestruct contract and burn any remaining Ether.
	}

	/* Function that calculates the time (in seconds) passed
	** since the startTime value of the contract.
	*/
	function timeDif()
	public
	view 
	returns(uint256)
	{
		uint256 duration = now - covenant.startTime;
		return duration;
	}

	/* Function checking that the client paid by checking if the balance of the contract's address
	** is equal to the price plus the collateral amount specified in the contract
	*/ 
	function clientPaid()
	public
	view
	returns(bool)
	{
		if (contractAddress.balance >= covenant.price + covenant.collateralAmount)
			return true;
		else
			return false;
	}

	// @notice Will receive any eth sent to the contract
	function () external payable {
	}

}

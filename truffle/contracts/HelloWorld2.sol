pragma solidity ^0.5.0;

contract HelloWorld2 {
    function sayHello() 
	public 
	pure 
	returns(bytes32)
    {
        bytes32 hello = "Hello World";
	return hello;
    }
}

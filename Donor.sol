pragma solidity ^0.5.0;

/*
Following code defines the structure for the donor.
Donor can do the following activities:
1) Send Money
2) Withdraw money if donated amount on hold.
3) 
*/


/*
To-do Task:
Maintain a map for balance against each user in Donee account. (address => (uint256 => bool))
*/
contract Donor {
	string name;
	uint256 mint;
	string wallet;
	
	mapping (uint256 => address) Donor; //Stores donors unique ID with address.
	mapping (address => uint256) Balance; //Balance against each donor 
	mapping (address => address) Destination_Account; //Stores name of NGO/Fundraiser funded. 
	
	constructor(string email, uint256 balance, string wallet_id) { 
		name = email;
		mint = balance;
		wallet = wallet_id;
	}

	function donate(address destination , uint256 amount) { 
		address sender = msg.sender;
		address donee = destination;
		uint256 money = amount;

		/*
		Code for calling transfer function
		*/
	}

	function withdraw(address donee_id, uint256 amount){
		
		//Check for donation status using function donated_status.
		//Don_Stat = donated_status(arguments)
		//If Don_Stat == 1 means all amount sent to NGO:
		revert();


		//If Don_Stat == 2 means amount asked exceeds the amount donated.

		revert();

		
		//If Don_Stat == 3 amount asked for return not donated

		/*
		Call transfer function to msg.sender() from donee adress;
		Balance update for msg.sender() wallet;
		*/		
	}
	
	function donated_status(address donee_id , uint256 amount) returns uint8 {
		/*
		Call to NGO contract for balance update returning 1,2,3.
		*/
	}	
}


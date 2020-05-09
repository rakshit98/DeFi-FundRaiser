pragma solidity ^0.5.0;

contract DonorBox {

uint256 Id;


event MoneySent(string milestone, uint256 amount);

struct Funder {
	address addr;
	uint256 amount;
	
}

struct NGO {
	uint256 ngo_id;
	string name;
	uint256 target;
	bool isOwner;
	uint256[3] milestone;
	address owner;
	uint256 fund;
	mapping (address => mapping(uint256 => bool)) transaction;
}

NGO private list[100];

constructor(address owner , string memory fundraiser_name , uint256 fundraiser_target) public {
	list[id].ngo_id = id;
	list[id].name = fundraiser_name;
	list[id].target = fundraiser_target;
	list[id].isOwner = true;
	list[id].milestone[0] = fundraiser_target/3;
	list[id].milestone[1] = 2*fundraiser_target/3;
	list[id].milestone[2] = fundraiser_target;
	list[id].owner = owner;
	list[id].fund = 0;
	list[id].last_thresh = 0;
}

function milestone (uint256 id, uint256 balance , uint8 last_thresh) returns(bool res) internal {
		if(balance > list[id].milestone[0] && balance < list[id].milestone[1] && last_thresh != 1){
			/*
				Transfer money to owner's address

				transfer(msg.sender, list[id].owner, balance);

			*/
			emit MoneySent("Milestone 1 achieved", balance);
			return true;
		}
		else if(balance > list[id].milestone[1] && balance < list[id].milestone[2] && last_thresh !=2){

			/*
				transfer(msg.sender, list[id].owner , balance - list[id].milestone[0])
			*/

			emit MoneySent("Milestone 2 achieved", balance - list[id].milestone[0]);
			return true;
		}
		else if(balance > fundraiser_target && last_thresh == 2){
			/*
				transfer(msg.sender , list[id].owner , balance - list[id].milestone[1])
			*/

			emit MoneySent("Target reached", balance - list[id].milestone[1]);
			return true;
		}
		else
			return false;

}

function receive(uint256 fundraiser_id, address sender, uint256 amount){
		bool up;
		list[fundraiser_id].transaction[sender][amount] = 0; //What to do if same amount is donated twice by same user.
		list[fundraiser_id].fund += amount; //Update balance .
		up = milestone(fundraiser_id, list[fundraiser_id].fund , list[fundraiser_id].last_thresh); 

		if(up) 
		{
			list[fundraiser_id].last_thresh += 1;  //update the threshold of milestone reached.		
			for(uint256 i=0;i< list[fundraiser_id].transaction ; i++){
				for(uint256 j=0; j< list[fundraiser_id].transaction[address]; j++){
					
				}
			}
		}
}

}

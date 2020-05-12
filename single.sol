pragma solidity ^0.5.0;

contract DonorBox {

mapping (uint256 => uint256) _balance;


event MoneySent(string milestone, uint256 amount);
event Target(string milestone);
event NGO_Transfer(string success);
event SignUp(string message,uint256 index,string name , uint256 target, uint256 Owner);


struct NGO {
	uint256 ngo_id;
	string name;
	uint256 target;
	bool isOwner;
	uint256[3] milestone;
	uint256 owner;
	uint256 fund;
	uint256 last_thresh;
	mapping (address => mapping(uint256 => bool)) transaction;
}

NGO[100] private list;



function sign_up(string memory fundraiser_name , uint256 fundraiser_target, uint256 index, uint256 owner) public {
	list[index].ngo_id = index;
	list[index].name = fundraiser_name;
	list[index].target = fundraiser_target;
	if(owner == 0){
	list[index].isOwner = true;
	}
	else
	{
	    list[index].isOwner = false;
	}
	list[index].milestone[0] = fundraiser_target/3;
	list[index].milestone[1] = 2*fundraiser_target/3;
	list[index].milestone[2] = fundraiser_target;
	list[index].owner = owner;
	list[index].fund = 0;
	list[index].last_thresh = 0;

	emit SignUp("New Account Created",index,list[index].name,list[index].milestone[2],list[index].owner);
}

function milestone (uint256 id, uint256 amount , uint256 last) public returns(bool res, uint256 transfer_amount, uint256 owner) {

		list[id].fund += amount;
		_balance[id] += amount;
		if(list[id].fund < list[id].milestone[0]){
			return (false,0 , list[id].owner);
		}

		else if(list[id].fund > list[id].milestone[0] && list[id].fund < list[id].milestone[1] && last != 1){
			list[id].last_thresh = 1;
			/*
				Transfer money to owner's address

				transfer(msg.sender, list.owner, lidt.fund);

			*/
			emit MoneySent("Milestone 1 achieved", list[id].fund);
			return (true,list[id].fund, list[id].owner);
		}
		else if(list[id].fund > list[id].milestone[1] && list[id].fund < list[id].milestone[2] && last !=2){

			list[id].last_thresh = 2;
			/*
				transfer(msg.sender, list.owner , list.fund - list.milestone[0])
			*/

			emit MoneySent("Milestone 2 achieved", list[id].fund - list[id].milestone[0]);
			return (true,list[id].fund - list[id].milestone[0], list[id].owner);
		}
		else if(list[id].fund >= list[id].milestone[2] && last == 2){
			list[id].last_thresh = 3;
			/*
				transfer(msg.sender , list.owner , list.fund - list.milestone[1])
			*/

			emit MoneySent("Target reached", list[id].fund - list[id].milestone[1]);
			return (true , list[id].fund - list[id].milestone[1], list[id].owner);
		}

		else
			{
				emit Target("Target already achieved.Sending amount to owner.");
				return (true , amount, list[id].owner);
			}
		

}

function show_balance(uint256 fundraiser_id) public view returns(uint256){
		if(list[fundraiser_id].isOwner)
		return _balance[fundraiser_id];

		return list[fundraiser_id].fund;
}

function transfer(uint256 fundraiser_id , uint256 owner ,uint256 amount) public{
	_balance[fundraiser_id] -= amount;
	_balance[owner] += amount;
	emit NGO_Transfer("Amount Transfered to Owner.");
}

}



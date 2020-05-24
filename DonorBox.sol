pragma solidity ^0.5.0;

contract DonorBox {

mapping (address => uint256) _balance;

mapping (uint256 => uint256) _owners; //Fundraiser to NGO

event Milestone(string milestone, uint256 amount);
event Target(string milestone);
event NGO_Transfer(string success,uint256 amount);
event Fundraiser(string message,uint256 index, string name, uint256 target);
event SignUp(string message,uint256 index,string name);
event SignUp_d(string message,uint256 index,string name);
event Transfer(string message,uint256 sender, uint256 receiver, uint256 amount);

struct NGO { //NGO Account
	uint256 ngo_id;
	string ngo_name;
	address ngo_wallet;
}

struct FundRaiser { //Fundraiser Account
	uint256 fundraiser_id;
	string fundraiser_name;
	uint256 fund;
	uint256 fundraiser_target;
	address fundraiser_wallet;
	uint256 last_thresh;

}

struct Donor{
	uint256 donor_id;
	string name;
	address wallet;
}

NGO[] private NGO_Account;
FundRaiser[] private Fundraiser_Account;
Donor[] private Donor_Account;

function donor_signup(string memory name, address wallet) public{
	uint256 index = Donor_Account.length;
	Donor memory create = Donor(index+1,name,wallet);
	Donor_Account.push(create);
	emit SignUp_d("Donor Account Created", index+1,Donor_Account[index].name);
}

function ngo_signup(string memory ngo_name, address wallet) public {
	uint256 index = NGO_Account.length;
	NGO memory create = NGO(index+1,ngo_name,wallet);
	NGO_Account.push(create);

	emit SignUp("Account Created",index+1,NGO_Account[index].ngo_name);
}

function create_fundraiser(string memory fundraiser_name,uint256 fundraiser_target, uint256 owner, address wallet) public {
	uint256 index = Fundraiser_Account.length;
	FundRaiser memory create = FundRaiser(index+1,fundraiser_name,0,fundraiser_target,wallet,0);
	Fundraiser_Account.push(create);
	_owners[index+1] = owner;
	emit Fundraiser("Fundraiser Started",Fundraiser_Account[index].fundraiser_id,Fundraiser_Account[index].fundraiser_name,Fundraiser_Account[index].fundraiser_target);
}

function milestone (uint256 fundraiser_id, uint256 amount) public{

		Fundraiser_Account[fundraiser_id-1].fund += amount;
		if(Fundraiser_Account[fundraiser_id-1].fund < Fundraiser_Account[fundraiser_id-1].fundraiser_target/3)
			return;

		if(Fundraiser_Account[fundraiser_id-1].fund > Fundraiser_Account[fundraiser_id-1].fundraiser_target/3 && Fundraiser_Account[fundraiser_id-1].fund < 2*Fundraiser_Account[fundraiser_id-1].fundraiser_target/3 && Fundraiser_Account[fundraiser_id-1].last_thresh == 0){
			Fundraiser_Account[fundraiser_id-1].last_thresh = 1;
			/*
				Transfer money to owner's address

				transfer(msg.sender, Fundraiser_Account.owner, lidt.fund);

			*/
			emit Milestone("Milestone 1 achieved", Fundraiser_Account[fundraiser_id-1].fund);
		}
		else if(Fundraiser_Account[fundraiser_id-1].fund > 2*Fundraiser_Account[fundraiser_id-1].fundraiser_target/3 && Fundraiser_Account[fundraiser_id-1].fund < Fundraiser_Account[fundraiser_id-1].fundraiser_target && Fundraiser_Account[fundraiser_id-1].last_thresh ==1){

			Fundraiser_Account[fundraiser_id-1].last_thresh = 2;
			/*
				transfer(msg.sender, Fundraiser_Account.owner , Fundraiser_Account.fund - Fundraiser_Account.milestone[0])
			*/

			emit Milestone("Milestone 2 achieved", Fundraiser_Account[fundraiser_id-1].fund - Fundraiser_Account[fundraiser_id-1].fundraiser_target/3);
		}
		else if(Fundraiser_Account[fundraiser_id-1].fund >= Fundraiser_Account[fundraiser_id-1].fundraiser_target && Fundraiser_Account[fundraiser_id-1].last_thresh == 2){
			Fundraiser_Account[fundraiser_id-1].last_thresh = 3;
			/*
				transfer(msg.sender , Fundraiser_Account.owner , Fundraiser_Account.fund - Fundraiser_Account.milestone[1])
			*/

			emit Milestone("Target reached", Fundraiser_Account[fundraiser_id-1].fund - Fundraiser_Account[fundraiser_id-1].fundraiser_target*2/3);
		}

		else if(Fundraiser_Account[fundraiser_id-1].last_thresh == 3)
			{
				emit Milestone("Target already achieved.Sending amount to owner.",amount);
			}
		else
			return;
}

function show_ngo_balance(uint256 ngo_id) public view returns(uint256 bal){
		return _balance[NGO_Account[ngo_id-1].ngo_wallet];
}

function show_donor_balance(uint256 donor_id) public view returns(uint256 bal){
	return _balance[Donor_Account[donor_id-1].wallet];
}

function show_fundraiser_balance(uint256 fundraiser_id) public view returns(uint256 bal){
		return Fundraiser_Account[fundraiser_id-1].fund;
}

function transfer(uint256 fundraiser_id,uint256 amount) public {
	_balance[Fundraiser_Account[fundraiser_id-1].fundraiser_wallet] -= amount;
	_balance[NGO_Account[_owners[fundraiser_id]-1].ngo_wallet] += amount;
	emit NGO_Transfer("Amount Transfered to Owner.",amount);
}

function donor_to_fundraiser(uint256 donor_id, uint256 fundraiser_id, uint256 amount) public {
	assert(Fundraiser_Account[fundraiser_id-1].fundraiser_wallet != address(0));
	assert(_balance[Donor_Account[donor_id-1].wallet] > amount);
	_balance[Donor_Account[donor_id-1].wallet] -= amount;
	_balance[Fundraiser_Account[fundraiser_id-1].fundraiser_wallet] += amount;
	emit Transfer("Amount Transferred",donor_id,fundraiser_id,amount);
}

function mint(uint256 donor_id,uint256 money) public {
	_balance[Donor_Account[donor_id-1].wallet] += money;
}

function withdraw(uint256 donor_id,uint256 fundraiser_id,uint256 amount) public{
	Fundraiser_Account[fundraiser_id-1].fund -= amount;
	_balance[Fundraiser_Account[fundraiser_id-1].fundraiser_wallet] -= amount;
	_balance[Donor_Account[donor_id-1].wallet] += amount;

	emit Transfer("Amount Transferred",fundraiser_id, donor_id, amount);
}
}
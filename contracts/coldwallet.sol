pragma solidity >=0.4.22 <0.6.0;

contract ColdWallet {
  address public owner;
  uint public total;
  bool public complete;

  constructor()
    public
  {
    owner = msg.sender;
    complete = false;
  }

  function payout()
    public {
    require(msg.sender == owner);
    complete = true;
    owner.transfer(this.balance);
  }

  function ()
    payable {
    if (complete) {
      msg.sender.transfer(msg.value);
    }
  }

}

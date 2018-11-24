pragma solidity >=0.4.22 <0.6.0;

contract ColdWallet {
  address public owner;
  uint public total;

  constructor()
    public
  {
    owner = msg.sender;
  }

  function payout()
    public
  {
    require(msg.sender == owner);
    owner.transfer(this.balance);
  }

  function ()
    payable
  {
    total = msg.value;
  }

}

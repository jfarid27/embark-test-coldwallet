pragma solidity >=0.4.22 <0.6.0;

contract ColdWallet {
  address public owner;
  uint public total;

  constructor() public {
    owner = msg.sender;
  }

  function payout() public {
    require(msg.sender == owner);
    msg.sender.transfer(total);
  }

  function () payable {
    total = msg.value;
  }

}

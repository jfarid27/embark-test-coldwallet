const ColdWallet = require('Embark/contracts/ColdWallet');
const { expect } = require('chai');

let accounts;

config({
  contracts: {
    "ColdWallet": {
      args: []
    }
  },
  accounts: [
    {
      privateKey: 'foobar',
      balance: '5000000'
    }
  ]
}, (_err, web3_accounts) => {
  accounts = web3_accounts
});

contract("ColdWallet", function () {
  this.timeout(0);

  it("should correctly initialize the ColdWallet", async () => {
    let result = await ColdWallet.owner();
    assert.strictEqual(result, accounts[0]);
  });

  describe('after payment', () => {
    const amount = '5000000';

    before(async function() {
      await web3.eth.sendTransaction({
        value: amount,
        from: accounts[0],
        to: ColdWallet.options.address
      });
    });

    it("should have correctly accepted payment", async () => {
      let stored = await web3.eth.getBalance(ColdWallet.options.address);
      expect(stored, 'Cold wallet should store the ETH it was given.').to.equal(amount);
    });

    it("should payout if owner calls payout", async () => {
      await ColdWallet.methods.payout().call({ from: accounts[0] });
      let payoutStored = await web3.eth.getBalance(ColdWallet.options.address);
      expect(payoutStored, "Wallet funds should be cleared.").to.equal('0');
    });
  });
});

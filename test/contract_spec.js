const ColdWallet = require('Embark/contracts/ColdWallet');
const { expect } = require('chai');

let accounts;

config({
  accounts: [
    {
      privateKey: 'foobar',
      balance: 5000000
    }
  ]
}, (_err, web3_accounts) => {
  accounts = web3_accounts
});

contract('ColdWallet', function () {
  this.timeout(0);
  let coldWallet;

  before(async function() {
    coldWallet = await ColdWallet.deploy().send({ from: accounts[0]});
  });

  it('should correctly initialize the ColdWallet', async () => {
    let owner = await coldWallet.methods.owner().call();
    expect(owner).to.equal(accounts[0]);
  });

  describe('after payment', () => {
    const amount = 5000000;

    before(async function() {
      await web3.eth.sendTransaction({
        value: amount,
        from: accounts[0],
        to: coldWallet.options.address
      });
    });

    it('should have correctly accepted payment', async () => {
      let stored = await web3.eth.getBalance(coldWallet.options.address);
      expect(parseInt(stored), 'Cold wallet should store the ETH it was given.').to.equal(amount);
    });

    it('should payout if owner calls payout', async () => {
      let res = await coldWallet.methods.payout().call({ from: accounts[0] });
      console.log(res)
      let payoutStored = await web3.eth.getBalance(coldWallet.options.address);
      let intPayout = parseInt(payoutStored);
      expect(intPayout, 'Wallet funds should be cleared after calling payout.').to.equal(0);
    });
  });
});

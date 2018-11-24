const ColdWallet = require('Embark/contracts/ColdWallet');
const { expect } = require('chai');

let accounts;

config({
  accounts: [
    {
      privateKey: 'foobar',
      balance: 999999999999
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

    describe('on payout call', () => {
      let isComplete;

      before(async () => {
        await coldWallet.methods.payout().send({ from: accounts[0] });
        isComplete = await coldWallet.methods.complete().call();
      });

      it('should set isComplete to truthy', () => {
        expect(isComplete).to.be.true;
      });

      it('should payout if owner calls payout', async () => {
        let payoutStored = await web3.eth.getBalance(coldWallet.options.address);
        let intPayout = parseInt(payoutStored);
        expect(intPayout, 'Wallet funds should be cleared after calling payout.').to.equal(0);
      });

      describe('on subsequent payout calls', () => {
        let transaction, balanceBefore;

        before(async () => {
          balanceBefore = await web3.eth.getBalance(accounts[0]);
          balanceBefore = parseInt(balanceBefore);
          transaction = await web3.eth.sendTransaction({
            value: amount,
            from: accounts[0],
            to: coldWallet.options.address
          });
        });

        it('should not store eth', async () => {
          let payoutStored = await web3.eth.getBalance(coldWallet.options.address);
          let intPayout = parseInt(payoutStored);
          expect(intPayout, 'Wallet should no longer accept funds.').to.equal(0);
        });
      });
    });
  });
});

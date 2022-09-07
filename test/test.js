const { expect } = require("chai");
const { loadFixture } = require("ethereum-waffle");
const { parseEther } = require("ethers/lib/utils");

describe("MultiSigWallet", () => {
  async function testFixture() {
    let MultiSigWalletContract;
    let MultiSigWallet;
    let xTokenContract;
    let xToken;

    const [
      owner,
      signer1,
      signer2,
      signer3,
      signer4,
      signer5,
      signer6,
      signer7,
    ] = await ethers.getSigners();

    MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    MultiSigWalletContract = await MultiSigWallet.deploy();
    await MultiSigWalletContract.deployed();

    xToken = await ethers.getContractFactory("xToken");
    xTokenContract = await xToken.deploy(1000);
    await xTokenContract.deployed();

    return {
      owner,
      MultiSigWalletContract,
      xTokenContract,
      signer1,
      signer2,
      signer3,
      signer4,
      signer5,
      signer6,
      signer7,
    };
  }

  describe("Contracts deployed....", () => {
    it("Should set the rightful owner of MultiSigWallet contract", async () => {
      const { owner, MultiSigWalletContract } = await loadFixture(testFixture);
      expect(await MultiSigWalletContract.owner()).to.be.equal(owner.address);
    });

    it("should set the rightful owner of xToken contract", async () => {
      const { owner, xTokenContract } = await loadFixture(testFixture);
      expect(await xTokenContract.owner()).to.be.equal(owner.address);
    });

    it("should let owner add signers", async () => {
      const { MultiSigWalletContract, signer1, signer2 } = await loadFixture(
        testFixture
      );
      await MultiSigWalletContract.addSigner(signer1.address);

      expect(await MultiSigWalletContract.isSigners(signer1.address)).to.be
        .true;
    });

    it("should get transaction count", async () => {
      const { MultiSigWalletContract, signer1 } = await loadFixture(
        testFixture
      );
      const data = await MultiSigWalletContract.getSigners();

      expect(signer1.address).to.be.equal(data[1]);
    });

    it("should get total number of signers", async () => {
      const { MultiSigWalletContract } = await loadFixture(testFixture);

      const data = await MultiSigWalletContract.numOfSigners();

      //signers is 2 owner and signer1
      expect(data).to.be.equal(2);
    });

    it("should let the signers to submit a transaction in ETH", async () => {
      const { MultiSigWalletContract, signer1 } = await loadFixture(
        testFixture
      );
      await MultiSigWalletContract.submitETHTransaction(signer1.address, 1);
    });

 

    it("should get the transactions info", async () => {
      const { MultiSigWalletContract } = await loadFixture(testFixture);
      await MultiSigWalletContract.transactions(0);

      const count = await MultiSigWalletContract.getTransactionCount();
      expect(count).to.be.equal(1);

      //expect the transaction 0 to fail without  any approval
      await expect(MultiSigWalletContract.executeTransaction(0)).to.be.reverted;
    });

    it("should let the signers to approve a transaction", async () => {
      const { MultiSigWalletContract, signer2, owner, signer7 } =
        await loadFixture(testFixture);

      //expect to fail cause signer 7 is not a signer
      await expect(
        MultiSigWalletContract.connect(signer7).approveTransaction(0)
      ).to.be.reverted;

      await MultiSigWalletContract.connect(owner).approveTransaction(0);

      //   should fail cause doesn't get enough approvals
      //   owner, signer1, singer2 is signers
      //   2 approvals needed
      await expect(MultiSigWalletContract.executeTransaction(0)).to.be.reverted;
    });


    it("should let the signers to revoke a transaction", async () => {
        const { MultiSigWalletContract, signer1  } = await loadFixture(
            testFixture
          );

          await MultiSigWalletContract.revokeTransaction(0);

          await expect( MultiSigWalletContract.executeTransaction(0, {
            value: 1,
          })).to.changeEtherBalance(signer1, 1).to.be.reverted;
    });

    it("should let the signers to execute a transaction once approvals is enough", async () => {
      const { MultiSigWalletContract, signer1, signer2 } = await loadFixture(
        testFixture
      );

      await MultiSigWalletContract.addSigner(signer2.address);
      await MultiSigWalletContract.connect(signer2).approveTransaction(0);
      await MultiSigWalletContract.approveTransaction(0)

     expect(await MultiSigWalletContract.executeTransaction(0, {
        value: 1,
      })).to.changeEtherBalance(signer1, 1);
    });

    
  describe("for ERC20 transaction", ()=>{
    it("should let the signers to submit approve execute a transaction in ERC20",async() =>{
        const { MultiSigWalletContract, xTokenContract, signer1 } = await loadFixture(testFixture);

        await MultiSigWalletContract.submitERC20Transaction(signer1.address, 1)
        await MultiSigWalletContract.setERC20address(xTokenContract.address)
        await xTokenContract.mint(MultiSigWalletContract.address, 10)
        
        await MultiSigWalletContract.approveTransaction(0)

        await MultiSigWalletContract.executeTransaction(0)

        console.log( await xTokenContract.balanceOf(signer1.address))
    })
  })


  });

  
});

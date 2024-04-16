import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Bridge", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployBridge() {
    // const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    // const ONE_GWEI = 1_000_000_000;

    // const lockedAmount = ONE_GWEI;
    // const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    // Contracts are deployed using the first signer/account by default
    const [owner, vault] = await hre.ethers.getSigners();

    const Bridge = await hre.ethers.getContractFactory("Bridge");
    const bridge = await Bridge.deploy(vault);

    return { bridge, owner, vault };
  }
  describe("tests", function () {
    it("Should send eth to the vault and emit deposit event", async () => {
      const ETH: bigint = hre.ethers.parseEther("1");
      const { bridge, owner, vault } = await loadFixture(deployBridge);
      const vaultBalanceBefore = await hre.ethers.provider.getBalance(vault.address);
      const solAddress = "test_sol_address";
      await expect(bridge.connect(owner).deposit(solAddress, {value: ETH }))
        .to.emit(bridge, "EthDeposit")
        .withArgs(solAddress, owner.address, ETH);
      const vaultBalance = await hre.ethers.provider.getBalance(vault.address);
      expect(vaultBalance - vaultBalanceBefore).to.equal(ETH);
    });
    it("Should revert when depositing 0 ETH", async () => {
      const {bridge, owner} = await loadFixture(deployBridge);
      const solAddress = "test_sol_address";
      const ETH = hre.ethers.parseEther("0");
      await expect(bridge.connect(owner).deposit(solAddress, {value: ETH})).to.be.revertedWith(
        "ETH deposit amount must be greater than 0"
      )
    });
  });
  // describe("Deployment", function () {
  //   it("Should set the right unlockTime", async function () {
  //     const { bridge, unlockTime } = await loadFixture(deployOneYearLockFixture);

  //     expect(await bridge.unlockTime()).to.equal(unlockTime);
  //   });

  //   // it("Should set the right owner", async function () {
  //   //   const { bridge, owner } = await loadFixture(deployOneYearLockFixture);

  //   //   expect(await lock.owner()).to.equal(owner.address);
  //   // });

  //   it("Should receive and store the funds to lock", async function () {
  //     const { bridge, lockedAmount } = await loadFixture(
  //       deployOneYearLockFixture
  //     );

  //     expect(await hre.ethers.provider.getBalance(bridge.target)).to.equal(
  //       lockedAmount
  //     );
  //   });

  //   it("Should fail if the unlockTime is not in the future", async function () {
  //     // We don't use the fixture here because we want a different deployment
  //     const latestTime = await time.latest();
  //     const Lock = await hre.ethers.getContractFactory("Lock");
  //     await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
  //       "Unlock time should be in the future"
  //     );
  //   });
  // });

  // describe("Withdrawals", function () {
  //   describe("Validations", function () {
  //     it("Should revert with the right error if called too soon", async function () {
  //       const { lock } = await loadFixture(deployOneYearLockFixture);

  //       await expect(lock.withdraw()).to.be.revertedWith(
  //         "You can't withdraw yet"
  //       );
  //     });

  //     it("Should revert with the right error if called from another account", async function () {
  //       const { lock, unlockTime, otherAccount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // We can increase the time in Hardhat Network
  //       await time.increaseTo(unlockTime);

  //       // We use lock.connect() to send a transaction from another account
  //       await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
  //         "You aren't the owner"
  //       );
  //     });

  //     it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
  //       const { lock, unlockTime } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // Transactions are sent using the first signer by default
  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).not.to.be.reverted;
  //     });
  //   });

  //   describe("Events", function () {
  //     it("Should emit an event on withdrawals", async function () {
  //       const { lock, unlockTime, lockedAmount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw())
  //         .to.emit(lock, "Withdrawal")
  //         .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
  //     });
  //   });

  //   describe("Transfers", function () {
  //     it("Should transfer the funds to the owner", async function () {
  //       const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).to.changeEtherBalances(
  //         [owner, lock],
  //         [lockedAmount, -lockedAmount]
  //       );
  //     });
  //   });
  // });
});

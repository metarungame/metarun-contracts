const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('Metarun Token Vesting', function () {
  const initialSupply = ethers.utils.parseUnits('1000000')
  let start
  const interval = 3600
  const duration = interval * 4
  const balance = ethers.utils.parseUnits('1')

  beforeEach(async function () {
    this.signers = await ethers.getSigners()
    this.deployer = this.signers[0]
    this.stranger = this.signers[1]

    const blockNumber = await ethers.provider.getBlockNumber()
    const block = await ethers.provider.getBlock(blockNumber)
    start = block.timestamp

    this.tokenFactory = await ethers.getContractFactory('MetarunToken')
    this.vestingFactory = await ethers.getContractFactory('TokenVesting')
    this.token = await this.tokenFactory.deploy()
    await this.token.mint(this.deployer.address, initialSupply)
    this.vesting = await this.vestingFactory.deploy(this.token.address)
    this.token.approve(this.vesting.address, initialSupply)
  })

  it('getter returns zeroes for unconfigured vestings', async function () {
    const vesting = await this.vesting.getVesting(this.stranger.address)
    expect(vesting[0]).to.equal('0')
    expect(vesting[1]).to.equal('0')
    expect(vesting[2]).to.equal('0')
    expect(vesting[3]).to.equal('0')
    expect(vesting[4]).to.equal('0')
  })

  describe('create vesting', function () {
    beforeEach('createVesting', async function () {
      await this.vesting.createVesting(
        this.deployer.address,
        start,
        interval,
        duration,
        balance
      )
    })

    it('vesting should have correct data', async function () {
      const vesting = await this.vesting.getVesting(this.deployer.address)
      expect(vesting[0]).to.equal(start)
      expect(vesting[1]).to.equal(interval)
      expect(vesting[2]).to.equal(duration)
      expect(vesting[3]).to.equal(balance)
      expect(vesting[4]).to.equal('0')
    })

    it('reverts when nothing to release', async function () {
      await expect(
        this.vesting.release(this.deployer.address)
      ).to.be.revertedWith('TokenVesting #release: nothing to release')
    })

    describe('reverts', function () {
      it('when interval > duration', async function () {
        await expect(
          this.vesting.createVesting(
            this.deployer.address,
            start,
            interval + 1,
            interval,
            balance
          )
        ).to.be.revertedWith(
          'TokenVesting #createVesting: interval cannot be bigger than duration'
        )
      })

      it('when interval = 0', async function () {
        await expect(
          this.vesting.createVesting(
            this.deployer.address,
            start,
            0,
            duration,
            balance
          )
        ).to.be.revertedWith(
          'TokenVesting #createVesting: interval must be greater than 0'
        )
      })

      it('when current balance > 0', async function () {
        await expect(
          this.vesting.createVesting(
            this.deployer.address,
            start,
            interval,
            duration,
            balance
          )
        ).to.be.revertedWith(
          'TokenVesting #createVesting: vesting for beneficiary already created'
        )
      })
    })

    const checkVesting = function (intervalsVested, alreadyReleased) {
      describe(`should vested ${intervalsVested} intervals`, async function () {
        it('vestedAmount', async function () {
          const vestedAmount = await this.vesting.vestedAmount(
            this.deployer.address
          )
          const intervalsVestedBN = ethers.BigNumber.from(intervalsVested)
          const durationBN = ethers.BigNumber.from(duration)
          const intervalBN = ethers.BigNumber.from(interval)
          const expectedVestedAmount = balance
            .mul(intervalsVestedBN)
            .div(durationBN.div(intervalBN))
          expect(vestedAmount).to.equal(expectedVestedAmount)
        })

        it('releasableAmount', async function () {
          const releasableAmount = await this.vesting.releasableAmount(
            this.deployer.address
          )
          const intervalsVestedBN = ethers.BigNumber.from(intervalsVested)
          const durationBN = ethers.BigNumber.from(duration)
          const intervalBN = ethers.BigNumber.from(interval)
          const alreadyReleasedBN = ethers.BigNumber.from(alreadyReleased)
          const expectedReleasableAmount = balance
            .mul(intervalsVestedBN.sub(alreadyReleasedBN))
            .div(durationBN.div(intervalBN))
          expect(releasableAmount).to.equal(expectedReleasableAmount)
        })
      })
    }

    const releaseAndCheckBalances = function (
      intervalsVested,
      alreadyReleased
    ) {
      describe(`should release token for ${intervalsVested} intervals`, function () {
        it('release', async function () {
          const releasableAmount = await this.vesting.releasableAmount(
            this.deployer.address
          )

          const openBalBeneficiary = await this.token.balanceOf(
            this.deployer.address
          )
          const openBalVestingContract = await this.token.balanceOf(
            this.vesting.address
          )
          const openBalVesting = ethers.BigNumber.from(
            (await this.vesting.getVesting(this.deployer.address))[3]
          )

          await this.vesting.release(this.deployer.address)

          const closeBalBeneficiary = await this.token.balanceOf(
            this.deployer.address
          )
          const closeBalVestingContract = await this.token.balanceOf(
            this.vesting.address
          )
          const closeBalVesting = ethers.BigNumber.from(
            (await this.vesting.getVesting(this.deployer.address))[3]
          )

          expect(closeBalBeneficiary).to.equal(
            openBalBeneficiary.add(releasableAmount)
          )
          expect(closeBalVestingContract).to.equal(
            openBalVestingContract.sub(releasableAmount)
          )
          expect(closeBalVesting).to.equal(openBalVesting.sub(releasableAmount))
        })
      })
    }

    context('time travel 1 interval', function () {
      beforeEach('time travel', async function () {
        await network.provider.send('evm_increaseTime', [interval])
        await network.provider.send('evm_mine')
      })
      checkVesting(1, 0)
      releaseAndCheckBalances(1, 0)
    })

    context('time travel 2 intervals minus 10 second', function () {
      beforeEach('time travel', async function () {
        await network.provider.send('evm_increaseTime', [interval * 2 - 10])
        await network.provider.send('evm_mine')
      })
      context('when released for interval 1', function () {
        beforeEach('release for interval 1', async function () {
          await this.vesting.release(this.deployer.address)
        })
        checkVesting(1, 1)
      })
    })

    context('time travel 2 intervals', function () {
      beforeEach('time travel', async function () {
        await network.provider.send('evm_increaseTime', [interval * 2 + 5])
        await network.provider.send('evm_mine')
      })
      checkVesting(2, 0)
      releaseAndCheckBalances(2, 0)
    })

    context('time travel 2 intervals and release after each', function () {
      beforeEach('time travel', async function () {
        await network.provider.send('evm_increaseTime', [interval + 5])
        await this.vesting.release(this.deployer.address)
        await network.provider.send('evm_increaseTime', [interval + 5])
        await network.provider.send('evm_mine')
      })
      checkVesting(2, 1)
      releaseAndCheckBalances(2, 1)
    })

    context('time travel 3 intervals and release', function () {
      beforeEach('time travel', async function () {
        await network.provider.send('evm_increaseTime', [interval * 3 + 5])
        await network.provider.send('evm_mine')
      })
      checkVesting(3, 0)
      releaseAndCheckBalances(3, 0)
    })

    context('time travel 4 intervals, postpone and release', function () {
      let newStart, wrongNewStart

      beforeEach('time travel', async function () {
        newStart = start + interval * 3
        wrongNewStart = start - 1
        await network.provider.send('evm_increaseTime', [interval * 4 + 5])
        await network.provider.send('evm_mine')
      })
      checkVesting(4, 0)

      context('postpone vesting', function () {
        describe('reverts', function () {
          it('when balance is 0 (vesting not extists)', async function () {
            await expect(
              this.vesting.connect(this.stranger).postponeVesting(newStart)
            ).to.be.revertedWith(
              'TokenVesting #postponeVesting: vesting for beneficiary does not exist'
            )
          })

          it('new start is before old start', async function () {
            await expect(
              this.vesting.postponeVesting(start)
            ).to.be.revertedWith(
              'TokenVesting #postponeVesting: new start date cannot be earlier than original start date'
            )

            await expect(
              this.vesting.postponeVesting(wrongNewStart)
            ).to.be.revertedWith(
              'TokenVesting #postponeVesting: new start date cannot be earlier than original start date'
            )
          })
        })

        it('postponeVesting', async function () {
          await this.vesting.postponeVesting(newStart)
          const vesting = await this.vesting.getVesting(this.deployer.address)

          expect(vesting[0]).to.equal(newStart)
          expect(vesting[1]).to.equal(interval)
          expect(vesting[2]).to.equal(duration)
          expect(vesting[3]).to.equal(balance)
          expect(vesting[4]).to.equal('0')
        })

        context('postpone 3 intervals', function () {
          beforeEach(async function () {
            await this.vesting.postponeVesting(newStart)
          })
          checkVesting(1, 0)
          releaseAndCheckBalances(1, 0)
        })
      })
    })
  })
})

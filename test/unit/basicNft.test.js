const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name) ? describe.skip : describe("BasicNft", () => {
    let nft, deployer

    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["basicnft"])

        nft = await ethers.getContract("BasicNft", deployer)
    })

    describe("Constructor", () => {
        it("Should set token counter to 0", async () => {
            assert.equal(await nft.getTokenCounter(), 0)
        })
    })

    describe("Mint", () => {
        it("Should increase token counter after minting", async () => {
            const beforeMintCounterValue = await nft.getTokenCounter()
            await nft.mintNft()
            const afterMintCounterValue = await nft.getTokenCounter()
            assert.equal(afterMintCounterValue.toNumber(), beforeMintCounterValue.toNumber() + 1)
        })
    })

})
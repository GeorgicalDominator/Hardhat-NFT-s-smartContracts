const { network  } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata")

const imagesLocation = "./images/random/"

let metadataTemplate = {
    name: "",
    description:"",
    image:"",
    attributes: [
        {
            trait_type: "Cuteness",
            value:100,
        }
    ]
}

let tokenUris = [
    "ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo",
    "ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d",
    "ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm",
]

const FUND_AMOUNT = "1000000000000000000000"

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let vrfCoordinatorV2Address, subId

    if (process.env.UPLOAD_TO_PINATA == "true"){
        tokenUris = await handleTokenUris()
    }

    if (chainId == 31337) {
        const VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = VRFCoordinatorV2Mock.address
        const trResp = await VRFCoordinatorV2Mock.createSubscription()
        const trReceipt = await trResp.wait(1)
        subId = trReceipt.events[0].args.subId
        await VRFCoordinatorV2Mock.fundSubscription(subId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["VRFCoordinatorV2"] 
        subId = networkConfig[chainId]["subscriptionId"]
    }

    log("------------------------------------------------------------")
    

    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    const subscriptionId = networkConfig[chainId]["subscriptionId"]
    const gasLane = networkConfig[chainId]["gasLane"]
    const mintFee = networkConfig[chainId]["mintFee"]


    const args = [vrfCoordinatorV2Address, subscriptionId, gasLane, mintFee, callbackGasLimit, tokenUris]

    const randomIpfsNftContract = await deploy("RandomIpfsNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })


    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(randomIpfsNftContract.address, args)
    }
}

async function handleTokenUris() {
    tokenUris = []

    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)
    for (imageUploadResponseIndex in imageUploadResponses) {
        let tokenUriMetadata = { ...metadataTemplate }

        tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "")
        tokenUriMetadata.description = `an addorable ${tokenUriMetadata.name} pup!` 
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`

        console.log(`uploading ${tokenUriMetadata.name}...`)

        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }

    console.log("Token URI's uploaded:")
    console.log(tokenUris)

    return tokenUris
}

module.exports.tags = ["all", "randomipfs", "main"]
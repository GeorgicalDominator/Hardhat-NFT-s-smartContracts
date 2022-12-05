const pinataSDK = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")

const pinataApiKey = process.env.PINATA_API_KEY
const pinataApiSecret = process.env.PINATA_API_SECRET
const pinata = new pinataSDK(pinataApiKey, pinataApiSecret)

async function storeImages(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath).filter((file) => file.includes(".png"))
    let responses = []
    console.log("uploading to IPFS...")

    for (const fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`)
        const options = {
            pinataMetadata: {
                name: files[fileIndex],
                keyvalues: {
                    customKey: 'customValue',
                    customKey2: 'customValue2'
                }
            },
        }
        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile, options)
            responses.push(response)
        } catch (e) {
            console.log(e)
        }
    }
    return { responses, files }
}

async function storeTokenUriMetadata(metadata) {
    const options = {
        pinataMetadata: {
            name: metadata.name,
        },
        keyvalues: {
            customKey: 'customValue',
            customKey2: 'customValue2'
        }
    }
    try {
        const response = await pinata.pinJSONToIPFS(metadata, options)
        return response
    } catch (e) {
        console.log(e)
    }
    return null
}

module.exports = { storeImages, storeTokenUriMetadata }
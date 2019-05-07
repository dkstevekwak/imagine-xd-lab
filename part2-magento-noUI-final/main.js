/*
 * Sample plugin scaffolding for Adobe XD.
 *
 * Visit http://adobexdplatform.com/ for API docs and more sample code.
 */

const { selection } = require("scenegraph");
const application = require("application");
const fs = require("uxp").storage;
const URL = "https://master-7rqtwti-72ihbiddruq4c.us-4.magentosite.cloud"
const credentials = require("./credentials.json");


async function main() {
    // GET admin token
    const token = await getAdminToken();
    // create a rendition
    const rendition = await createRendition();
    // read as arraybuffer
    const arraybuffer = await rendition.read({ format: fs.formats.binary });
    // convert arraybuffer to base64
    const base64 = base64ArrayBuffer(arraybuffer);

    const sku = "xdTest";
    const name = "XD Test";
    const price = 12;

    const response = addNewProductWithRendition({ token, base64, sku, name, price });
}

async function getAdminToken() {
    const tokenResponse = await fetch(`${URL}/rest/default/V1/integration/admin/token`, {
        method: "post",
        body: JSON.stringify(credentials),
        headers: {
            "Content-Type": "application/json"
        }
    })
    const token = await tokenResponse.json();
    return token;
}

async function createRendition() {
    // let user choose a folder
    const folder = await fs.localFileSystem.getFolder();
    // create a file netry in the folder
    const file = await folder.createEntry("rendition.png", { overwrite: true });
    // create a rendition config object
    const renditionConfig = [{
        node: selection.items[0],
        outputFile: file,
        type: application.RenditionType.PNG,
        scale: 2
    }]
    // create a rendition
    const rendition = await application.createRenditions(renditionConfig);
    // export the rendition
    const renditionFile = rendition[0].outputFile;
    return renditionFile;
}

async function addNewProductWithRendition({ token, base64, sku, name, price } = {}) {
    const body = {
        "product": {
            "sku": sku,
            "name": name,
            "visibility": 4,
            "type_id": "simple",
            "price": price,
            "status": 1,
            "attribute_set_id": 4,
            "custom_attributes": [
                {
                    "attribute_code": "cost",
                    "value": ""
                },
                {
                    "attribute_code": "description",
                    "value": "Description"
                }
            ],
            "media_gallery_entries": [
                {
                    "position": 1,
                    "disabled": true,
                    "label": "tiny1",
                    "media_type": "image",
                    "types": ["image", "thumbnail", "small_image"],
                    "content": {
                        "type": "image/png",
                        "name": "xdrendition.png",
                        "base64_encoded_data": base64
                    }
                }
            ]
        }
    }

    const productResponse = await fetch(`${URL}/rest/default/V1/products`, {
        method: "post",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })

    const result = await productResponse.json();
    console.log(result);
}


function base64ArrayBuffer(arrayBuffer) {
    var base64 = ''
    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

    var bytes = new Uint8Array(arrayBuffer)
    var byteLength = bytes.byteLength
    var byteRemainder = byteLength % 3
    var mainLength = byteLength - byteRemainder

    var a, b, c, d
    var chunk

    // Main loop deals with bytes in chunks of 3
    for (var i = 0; i < mainLength; i = i + 3) {
        // Combine the three bytes into a single integer
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

        // Use bitmasks to extract 6-bit segments from the triplet
        a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048) >> 12 // 258048   = (2^6 - 1) << 12
        c = (chunk & 4032) >> 6 // 4032     = (2^6 - 1) << 6
        d = chunk & 63               // 63       = 2^6 - 1

        // Convert the raw binary segments to the appropriate ASCII encoding
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
    }

    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
        chunk = bytes[mainLength]

        a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

        // Set the 4 least significant bits to zero
        b = (chunk & 3) << 4 // 3   = 2^2 - 1

        base64 += encodings[a] + encodings[b] + '=='
    } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

        a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008) >> 4 // 1008  = (2^6 - 1) << 4

        // Set the 2 least significant bits to zero
        c = (chunk & 15) << 2 // 15    = 2^4 - 1

        base64 += encodings[a] + encodings[b] + encodings[c] + '='
    }

    return base64
}


module.exports = {
    commands: {
        myPluginCommand: main
    }
};

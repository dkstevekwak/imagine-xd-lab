/*
 * Sample plugin scaffolding for Adobe XD.
 *
 * Visit http://adobexdplatform.com/ for API docs and more sample code.
 */

const { selection } = require("scenegraph");
const application = require("application");
const fs = require("uxp").storage;

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

module.exports = {
    commands: {
        myPluginCommand: createRendition
    }
};

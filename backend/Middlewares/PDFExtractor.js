const { PDFParse } = require("pdf-parse");

async function extractPDFText(fileDataPath) {
    const parser = new PDFParse({url: fileDataPath});
    const text = await parser.getText();
    return text.text;
}

module.exports = {
    extractPDFText
};
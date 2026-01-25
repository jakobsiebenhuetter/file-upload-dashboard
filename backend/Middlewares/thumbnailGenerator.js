const puppeteer = require('puppeteer');

const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const ffprobePath = require('ffprobe-static');
const crypto = require('crypto');

const fs = require('fs');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath.path);

const tnPath = './data/Thumbnails';

// PDF to PNG converter middleware
async function pdfConverter(pdfPath) {
    const { pdf } = await import('pdf-to-img');
    const uuid = crypto.randomUUID();
    const newthumbnailPath = `${tnPath}/${uuid}.png`;
    const document = await pdf(pdfPath);
    const pageBuffer = await document.getPage(1);

    fs.writeFileSync(newthumbnailPath, pageBuffer);
    return newthumbnailPath;
};

// Puppeteer browser middleware
async function startPuppeteerBrowser(filePath) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Read and escape file content to avoid accidental HTML injection

    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const escapeHtml = (str) =>
        str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const escaped = escapeHtml(fileContent);
    const htmlContent = `
    <!doctype html>
    <html lang="de">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Thumbnail</title>
        <style>
            .container {
                max-width: 960px;
                margin: 24px auto;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header>Datei: ${path.basename(filePath)}</header>
            <pre>${escaped}</pre>
        </div>
    </body>
    </html>
    `;

    await page.setContent(htmlContent);
    const tnImage = await page.screenshot();
    const uuid = crypto.randomUUID();
    const newthumbnailPath = `${tnPath}/${uuid}.png`;

    fs.writeFileSync(newthumbnailPath, tnImage);
    await browser.close();

    return newthumbnailPath;
}

// video thumbnail generator middleware
function createVideoThumbnail(videoPath, tnPath, fileName) {
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .on('end', resolve)
            .on('error', reject)
            .screenshots({
                count: 1,
                filename: fileName,
                folder: tnPath,
                size: '320x240'
            });
    });
}

module.exports = {
    pdfConverter,
    startPuppeteerBrowser,
    createVideoThumbnail
};

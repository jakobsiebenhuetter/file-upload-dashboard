const puppeteer = require("puppeteer-core");
const ffmpegPath = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const ffprobePath = require("ffprobe-static");
const pdf = require("pdf-poppler");

const crypto = require("crypto");

const fs = require("fs");
const path = require("path");
require("dotenv").config();

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath.path);

const tnPath = "./data/Thumbnails";

// PDF to PNG converter middleware

async function pdfConverter(pdfPath) {
  // Hier mit pdf-poppler arbeiten
  const uuid = crypto.randomUUID();
  const newthumbnailPath = path.join(`${tnPath}`, `${uuid}-1.png`);
  let options = {
    format: "png",
    out_dir: tnPath,
    out_prefix: uuid,
    page: 1,
  };
  try {
    const res = await pdf.convert(pdfPath, options);
    console.log("PDF erfolgreich konvertiert:", res);
  } catch (error) {
    console.error("Fehler bei der PDF-Konvertierung:", error);
  }

  return newthumbnailPath;
}

// Puppeteer browser middleware
console.log(process.env.BROWSER_PATH);
async function startPuppeteerBrowser(filePath) {
  const browser = await puppeteer.launch({
    headless: true,
    // Hier wurde der Pfad zur ausführbaren Chrome-Datei angepasst, damit es auf meinem System funktioniert. Auf anderen Systemen muss dieser Pfad ggf. angepasst werden.
    executablePath: process.env.BROWSER_PATH,
  });
  const page = await browser.newPage();

  // Read and escape file content to avoid accidental HTML injection

  const fileContent = fs.readFileSync(filePath, "utf-8");

  const escapeHtml = (str) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
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
async function createVideoThumbnail(videoPath, tnPath, fileName) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on("end", resolve)
      .on("error", reject)
      .screenshots({
        timestamps: ["00:00:01"],
        filename: fileName,
        folder: tnPath,
        size: "320x240",
      });
  });
}

async function generateTN(file) {
  let thumbnailPath = null;
  let filePath = file.path;
  const extname = path.extname(filePath);
  console.log("Generating thumbnail for:", filePath);
  console.log("File extension:", extname);
  try {
    switch (extname) {
      case ".pdf": {
        thumbnailPath = await pdfConverter(filePath);
        console.log("PDF thumbnail generated at:", thumbnailPath);
        break;
      }
      case ".mp4": {
        let fileName = path.basename(filePath);
        fileName = fileName.split(".")[0] + ".png";
        thumbnailPath = path.join(tnPath, fileName);
        await createVideoThumbnail(filePath, tnPath, fileName);
        break;
      }
      case ".txt": {
        thumbnailPath = await startPuppeteerBrowser(filePath);
        break;
      }
      default: {
        const fileName = path.basename(filePath);
        thumbnailPath = path.join(tnPath, fileName);
        fs.copyFileSync(filePath, thumbnailPath);
        break;
      }
    }
  } catch (error) {
    console.error("Error generating thumbnail:", error);
  }
  return thumbnailPath;
}


module.exports = {
  generateTN,
};

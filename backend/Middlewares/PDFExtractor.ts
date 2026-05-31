import { PDFParse } from "pdf-parse";

export async function extractPDFText(fileDataPath: string): Promise<string> {
    const parser = new PDFParse({ url: fileDataPath });
    const text = await parser.getText();
    return text.text;
}

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import fs from 'fs';
import path from 'path';

import { StorageInterface } from '../StorageInterface.js';
import { extractPDFText } from '../Middlewares/PDFExtractor.js';

const resolvePath = (p: string) => path.isAbsolute(p) ? p : path.resolve(p);

const storage = new StorageInterface('json');

export const server = new Server({
    name: "MCP File Tool Server",
    version: "1.0.0",
},
{
    capabilities: {tools: {}},
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
        {
            name: 'alle-Dokumente',
            description: 'Gibt eine Liste aller Dokumente zurück',
            inputSchema: {
                type: 'object',
                properties: {
                    folderId: { type: 'string', description: 'Die ID des Ordners, dessen Dokumente aufgelistet werden sollen' },
                },
                required: ['folderId'],
            }
        },

        {
            name: 'Dokumentinhalt-png',
            description: 'Gibt den Inhalt eines Bilddokuments zurück als base64',
            inputSchema: {
                type: 'object',
                properties: {
                    fileId: { type: 'string', description: 'Die ID des Bilddokuments, dessen Inhalt zurückgegeben werden soll' },
                    folderId: { type: 'string', description: 'Die ID des Ordners, in dem sich das Bilddokument befindet' },
                },
                required: ['fileId', 'folderId'],
            }
        },

        {
            name: 'Dokumentinhalt-pdf',
            description: 'Gibt den Inhalt eines Dokuments zurück',
            inputSchema: {
                type: 'object',
                properties: {
                    fileId: { type: 'string', description: 'Die ID des Dokuments, dessen Inhalt zurückgegeben werden soll' },
                    folderId: { type: 'string', description: 'Die ID des Ordners, in dem sich das Dokument befindet' },
                },
                required: ['fileId', 'folderId'],
            }
        }
    ]
}})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name } = request.params;
    const args = (request.params.arguments ?? {}) as { folderId?: string; fileId?: string };

    if(name === "alle-Dokumente") {
        const { filesForPage } = storage.getFiles(args.folderId as string, 1);
        return {
            content: [{ type: "text", text: JSON.stringify(filesForPage) }]
        };
    }

    if(name === "Dokumentinhalt-pdf") {
        const fileData = storage.getFile(args.folderId as string, args.fileId as string);
        if (fileData.path.endsWith('.pdf')) {
            console.error(`Extrahiere Text aus PDF: ${fileData.path}`);
            const text = await extractPDFText(resolvePath(fileData.path));
            return { content: [{ type: "text", text }] };
        }
    }

    if (name === "Dokumentinhalt-png") {
        const fileData = storage.getFile(args.folderId as string, args.fileId as string);
        console.error(`Lese Bilddatei: ${fileData.path}`);
        if(!fileData.path.endsWith('.png') && !fileData.path.endsWith('.jpeg')) return;
        const base64 = fs.readFileSync(resolvePath(fileData.path)).toString('base64');
            const mimeType = fileData.path.endsWith('.png') ? 'image/png' : 'image/jpeg';
            return {
                content: [{
                    type: "image",
                    data: base64,
                    mimeType:mimeType,
                }]
            };
        }
        throw new Error(`Tool ${name} nicht gefunden`);
    });
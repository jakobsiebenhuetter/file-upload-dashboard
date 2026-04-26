const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const fs = require('fs');

const StorageInterface = require('../StorageInterface.js');
const { extractPDFText } = require('../Middlewares/PDFExtractor.js');

const storage = new StorageInterface('json');

const server = new Server({
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
            name: 'Dokumentinhalt',
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
    const {name, arguments: args} = request.params;
    
    if(name === "alle-Dokumente") {
        const { filesForPage } = storage.getFiles(args.folderId, 1);
        return {
            content: [{ type: "text", text: JSON.stringify(filesForPage) }]
        };
    }
    
    if(name === "Dokumentinhalt") {
        const fileData = storage.getFile(args.folderId, args.fileId);
        if (fileData.path.endsWith('.pdf')) {
            const text = await extractPDFText(fileData.path);
            return { content: [{ type: "text", text }] };
            
        } else if (fileData.path.endsWith('.png') || fileData.path.endsWith('.jpg') || fileData.path.endsWith('.jpeg')) {
            const base64 = fs.readFileSync(fileData.path).toString('base64');
            const mimeType = fileData.path.endsWith('.png') ? 'image/png' : 'image/jpeg';
            return {
                content: [{
                    type: "image",
                    data: base64,
                    mimeType
                }]
            };
        }
    }
    throw new Error(`Tool ${name} nicht gefunden`);
})

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Server läuft und ist bereit für Anfragen.");
}

main().catch((error) => {
    console.error("Fehler beim Starten des Servers:", error);
    process.exit(1);
});

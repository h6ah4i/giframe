import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { addPrintFlow } from './util.js';
import GIFrame from '../../src/giframe.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filename: string = process.argv[2] || '1.gif';
const examplePath: string = path.resolve(__dirname, '..');
const stream: fs.ReadStream = fs.createReadStream(path.resolve(examplePath, 'img', filename), {
    highWaterMark: 10 * 1024
});

let done: boolean = false;
const giframe: GIFrame = new GIFrame();
const promise = new Promise<number>(resolve => {
    let chunkLen: number = 0;
    giframe.on(GIFrame.event.PIXEL, () => done = true);
    stream.on('data', (chunk: string | Buffer) => {
        chunkLen += chunk.length;
        if (!done) {
            if (Buffer.isBuffer(chunk)) {
                giframe.feed(chunk);
            }
            else {
                giframe.feed(Buffer.from(chunk));
            }
        }
    });
    stream.on('end', () => {
        resolve(chunkLen);
    })
});

addPrintFlow(giframe, filename, promise);

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { addPrintFlow } from './util.js';
import GIFrame from '../../src/giframe.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filename: string = process.argv[2] || '1.gif';
const examplePath: string = path.resolve(__dirname, '..');
let gifBuffer: Buffer = fs.readFileSync(path.resolve(examplePath, 'img', filename));
let range: number = 1000;
let gifBufferProxy: Buffer = new Proxy(gifBuffer, {
    get(target: Buffer, prop: string | symbol): unknown {
        if (prop === 'length') {
            return range;
        }
        if (typeof prop === 'symbol') {
            return target[prop];
        }
        if (typeof prop === 'string') {
            const intVal = parseInt(prop, 10);
            if (isNaN(intVal)) {
                return target[prop];
            }
            const numProp = intVal;
            if (numProp > range) {
                throw new Error('out of range');
            }
            return target[numProp];
        }
        return target[prop as number | string | symbol];
    }
});

const giframe: GIFrame = new GIFrame();
addPrintFlow(giframe, filename, Promise.resolve(gifBuffer.length));

let timer: NodeJS.Timeout | null = setInterval(() => {
    giframe.feed(gifBufferProxy.subarray(range - 1000, range));
    range += 1000;
}, 25);

giframe.on(GIFrame.event.PIXEL, () => {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
});

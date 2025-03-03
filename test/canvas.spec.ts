import {expect} from 'chai';
import path from 'path';
import { fileURLToPath } from 'url';
import { getMeta, getRGBAPixels, diffImage, writeTempImage, cleanTempDir } from './utils.js';
import { fileTypeFromBuffer } from 'file-type';
import createBase64 from '../src/utils/canvas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Node Canvas', () => {
    const samplePixels: Array<number> = [];
    let sampleWidth: number;
    let sampleHeight: number;
    let imgDir: string;

    before(async () => {
        imgDir = path.resolve(__dirname, 'img');
        sampleWidth = 20;
        sampleHeight = 10;
        for (let i = 0; i < sampleWidth * sampleHeight; i++) {
            samplePixels.push(100, 220, 220, 255);
        }
    });

    describe('The generated JPEG', () => {
        let outputPath: string;
        let sourcePath: string;
        let base64: string;

        before(async () => {
            sourcePath = path.resolve(imgDir, '1-1.jpg');
            const pixels: Uint8Array = await getRGBAPixels(sourcePath);
            const {width, height} = await getMeta(sourcePath);
            base64 = createBase64([...pixels], { width, height, quality: 1 });
            outputPath = await writeTempImage(base64);
        });

        it('should create a valid JPEG base64 string', async function () {
            const pixels: Array<number> = [...samplePixels];
            const width: number = sampleWidth;
            const height: number = sampleHeight;

            const base64: string = createBase64(pixels, { width, height });
            const ret: boolean = /^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+/.test(base64);
            expect(ret).to.be.true;
        });

        it('should have the correct mine type', async function () {
            const data: string = base64.replace(/^data:image\/\w+;base64,/, '');
            const type = await fileTypeFromBuffer(Buffer.from(data, 'base64'));
            expect(type.mime).to.be.equal('image/jpeg');
        });

        it('should be the same size', async function () {
            const { width, height } = await getMeta(sourcePath);
            const { width: targetWidth, height: targetHeight } = await getMeta(outputPath);
            expect(width === targetWidth && height === targetHeight).to.be.true;
        });

        it('should generate a same image', async function () {
            const diff: number = await diffImage(sourcePath, outputPath, 0.1);
            expect(diff).to.equal(0);
        });
    });

    describe('The generated PNG', () => {
        let outputPath: string;
        let sourcePath: string;
        let base64: string;

        before(async () => {
            sourcePath = path.resolve(imgDir, '1-1.png');
            const pixels: Uint8Array = await getRGBAPixels(sourcePath);
            const {width, height} = await getMeta(sourcePath);
            base64 = createBase64([...pixels], { width, height, usePNG: true });
            outputPath = await writeTempImage(base64);
        });

        it('should create a valid PNG base64 string', async function () {
            const pixels: Array<number> = [...samplePixels];
            const width: number = sampleWidth;
            const height: number = sampleHeight;

            const base64: string = createBase64(pixels, { width, height, usePNG: true });
            const ret: boolean = /^data:image\/png;base64,[A-Za-z0-9+\/=]+/.test(base64);
            expect(ret).to.be.true;
        });

        it('should have the correct mine type', async function () {
            const data: string = base64.replace(/^data:image\/\w+;base64,/, '');
            const type = await fileTypeFromBuffer(Buffer.from(data, 'base64'));
            expect(type.mime).to.be.equal('image/png');
        });

        it('should be the same size', async function () {
            const { width, height } = await getMeta(sourcePath);
            const { width: targetWidth, height: targetHeight } = await getMeta(outputPath);
            expect(width === targetWidth && height === targetHeight).to.be.true;
        });

        it('should generate a same image', async function () {
            const diff: number = await diffImage(sourcePath, outputPath);
            expect(diff).to.equal(0);
        });
    });

    after(() => cleanTempDir());
});

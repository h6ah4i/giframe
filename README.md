<div>
    <h1 align="center"><code>GIFrame</code>&nbsp;&nbsp;📸</h1>
    <p align="center">
        <strong>GIFrame.js can extract the GIF's first frame without reading whole bytes in both browsers and NodeJS environments.</strong>
    </p>
    <p align="center">
        <a href="https://github.com/h6ah4i/giframe/actions" target="_blank">
            <img src="https://github.com/h6ah4i/giframe/actions/workflows/ci.yml/badge.svg" alt="Build status" />
        </a>
        <a href="https://coveralls.io/github/h6ah4i/giframe?branch=main" target="_blank">
            <img src="https://coveralls.io/repos/github/h6ah4i/giframe/badge.svg?branch=main" alt="Coverage Status" />
        </a>
        <a href="https://opensource.org/licenses/mit-license.php" target="_blank">
            <img src="https://img.shields.io/github/license/h6ah4i/giframe" alt="MIT Licence" />
        </a>
    </p>
</div>

---

It's fast (decode on-demand) and compatible (both in browsers and nodejs).

No need to wait for and read all bytes and decode chunk by chunk, especially when only extracting the first frame. So it may be used for improving GIFs loading experiences, providing more controllable GIF loading strategies and so on.

<img src="./doc/img/example.gif" alt="exmaple" width="100%" />

## Motivation

Some websites contain a lot of [GIF images](https://en.wikipedia.org/wiki/GIF). Displaying animation images in your homepage, item list and so on may attract users' attention. However, GIF images are much larger than static images (sometimes 20x~30x depends on how many frames).

![](./doc/img/1.jpg)

As a result, users need to wait for a long time to see GIF images. A common method is to extract the first frame as a placeholder and load GIF lazily when in view or clicked. There are lots of libraries to extract frames in the server-side. However, it has some limitations:

- Most libs need to read whole bytes in GIF for extracting frames, even though we only need the first one. It's a waste of computing and time. For example, the first frame only use about 16% bytes in [`example/img/4.gif`](./example/img/4.gif) (8-frames) and .
- This solution needs the support of the server-side or CDN. Is there any frontend-only solution to improve user experience?

This repository aims to provide a stream-like (decode chunk by chunk) GIF decoder which can run in both browsers (client-side) and NodeJS (server-side).

- It will try to extract the needed frame without reading all bytes. You can read bytes and decode at the same time. It is useful especially when using stream in I/O.
- Running in browsers means you can display a early static frame when downloading GIF, or use the client itself to calculate.

Below is an browser example. _**The first frame is extracted and used as a placeholder while the GIF image is still loading.**_

![](./doc/img/example.gif)

You can also play with it by yourself. [Go to the `Example` section >>](#Example)

## Basic Usage

Support both in browsers and NodeJS,

```JavaScript
import GIFrame from 'giframe';
const giframe = new GIFrame();
giframe.getBase64().then(base64 => {
    // finally get the base64 string of the first frame
    console.log(base64);
});

// then read GIF bytes from network, local file and so on
const source = readGIF('xxx.gif');
// chunk need to be Uint8Array
source.on('data', chunk => giframe.feed(chunk));
```

More complex usages can be found in `example/` directory. You can also run examples below ↓↓↓

## Example

> [Nodejs](https://nodejs.org/) required.

This repo provides some examples in `example/` which give you a quick start. 

Firstly, clone the repo and install dependencies.

```bash
git clone git@github.com:alienzhou/giframe.git
cd giframe

# install dependencies
npm i
```

Run in browsers,

```bash
npm run example:browser
```

Then it will open http://127.0.0.1:8080 (default port 8080), you will see a demo page ↓

![](./doc/img/example.jpg)

Or run in NodeJS,

```bash
# extract the first frame image
# you can change the gif filename (1.gif ~ 5.gif)
npm run example:node:stream 1.gif

# or you can run
npm run example:node:limit 1.gif

# then the first frame image will be written in example/output
```

![](./doc/img/example-node.jpg)


## How it works

For a quick and robust start, the decoder is mostly a folk of [omggif](https://github.com/deanm/omggif). GIF is composed of [many blocks](http://matthewflickinger.com/lab/whatsinagif/bits_and_bytes.asp). Giframe treats every block as a valid unit and resets the position to the previous block's end when meet an incomplete block. It will try to continue to decoding when receiving another chunk (more bytes). It's like stream.

To generate the image's base64, Giframe uses the Canvas API - [node-canvas](https://github.com/Automattic/node-canvas) in NodeJS and [native canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) in browsers. The canvas uses all RGBA pixels which are provided by Giframe to render a image and exports base64 string by `.toDataURL()`.

By the way, the example in `example/browser` uses [Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker), [`fetch` event](https://developer.mozilla.org/en-US/docs/Web/API/FetchEvent), [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) and [Readable Stream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/ReadableStream). It tees a stream from the response in fetch API and read it. Every chunk received will be used to decode progressively. Once the first frame is ready, it will be displayed on screen as a static preview.

## Compatibility

> **Discarded**: *~~Now GIFrame.js uses [`Proxy` object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to throw an error when accessing an out-of-range item in `Uin8Array` and catch it in the decoder to reset to the previous valid block's tail position. `Proxy` object [isn't compatible in some browsers](https://caniuse.com/#search=proxy).~~*

After v0.2.0, GIFrame uses a basic [`get` function](./src/utils/proxy.ts) instead of the `Proxy` object. So mostly its compatibility depends on `Uint8Array` and `Int32Array` which [are supported in most browsers](https://caniuse.com/#search=Uint8Array).

![compatibility](./doc/img/compatibility.png)

## License

[MIT](./LICENCE)

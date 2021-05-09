const { readFileSync } = require('fs')

const karlaFont = readFileSync(
  `${__dirname}/../src/assets/fonts/Karla-Regular.woff2`,
).toString('base64')
const spectralFont = readFileSync(
  `${__dirname}/../src/assets/fonts/Spectral-Regular.woff2`,
).toString('base64')

module.exports = function getHtml(data) {
  const { title, base64Image } = data

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        @font-face {
          font-family: Karla;
          font-style: normal;
          font-weight: 500;
          font-display: auto;
          src: url(data:font/woff2;charset=utf-8;base64,${karlaFont}) format('woff2');
        }
  
        @font-face {
          font-family: Spectral;
          font-style: normal;
          font-weight: 500;
          font-display: auto;
          src: url(data:font/woff2;charset=utf-8;base64,${spectralFont}) format('woff2');
        }
  
        :root {
          --headerFont: 'Spectral', serif;
          --bodyFont: 'Karla', serif;
        }
  
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          font-family: var(--headerFont);
        }
  
        body {
          font-family: var(--bodyFont);
          margin: 0;
        }
  
        * {
          box-sizing: border-box;
        }
      </style>
    </head>
    <body style="color: #0f0d35; background-color: #f6f7f3">
      <div
        style="
          height: 630px;
          overflow: hidden;
          display: flex;
          border: 10px solid #f4bb8a;
        "
      >
        <div>
          <img
            width="850px"
            style="max-width: 100%"
            src=${base64Image}
          />
        </div>
        <div
          style="
            display: flex;
            text-align: center;
            align-items: center;
            padding: 4rem;
            width: 1200px;
          "
        >
          <div>
            <h1
              style="
                font-size: 4.5rem;
                line-height: 1;
                font-weight: 500;
                margin: 0;
              "
            >
              ${title}
            </h1>
            <hr
              style="
                width: 50%;
                margin: 0 auto;
                margin-top: 2.5rem;
                border: 0;
                border-top: 2px solid #f4bb8a;
              "
            />
            <p
              style="
                font-size: 1.5rem;
                line-height: 2rem;
                margin: 0;
                margin-top: 2.5rem;
              "
            >
              By Kirils L @kirjai
            </p>
          </div>
        </div>
      </div>
    </body>
  </html>
  
  `
}

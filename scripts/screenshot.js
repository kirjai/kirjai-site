const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const base64Me = require('./base64-me')

/**
 * Taken from the one and only swyx:
 * https://github.com/sw-yx/swyxdotio/blob/60b088cea0439d3e2536a78dc922af3146ba40fd/screenshot-plugin/screenshot.js
 */

module.exports = screenshot
async function screenshot(PostArray) {
  const headless = true
  // const headless = false // for debug
  const browser = await puppeteer.launch({ headless })
  const page = await browser.newPage()
  page.setViewport({ width: 1200, height: 630 })
  const getHtml = require('./template')
  console.log('taking screenshots...')
  for (const post of PostArray) {
    const [slug, title] = post
    const html = getHtml({
      base64Image: base64Me,
      title,
    })
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    })
    const filePath = path.resolve(`src/assets/${slug}/og_image.png`)
    ensureDirectoryExistence(filePath)
    await page.screenshot({ path: filePath })
  }
  if (headless) {
    await browser.close()
  }
}

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath)
  if (fs.existsSync(dirname)) {
    return true
  }
  ensureDirectoryExistence(dirname)
  fs.mkdirSync(dirname)
}

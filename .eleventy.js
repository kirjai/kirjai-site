const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const CleanCSS = require('clean-css')
const pluginRss = require('@11ty/eleventy-plugin-rss')

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'Novemeber',
  'December',
]

const contentDate = (value) =>
  `${months[value.getMonth()]} ${value.getDate()}, ${value.getFullYear()}`

const nunjucks = (config) => {
  config.addNunjucksFilter('contentDate', contentDate)
}

module.exports = function (eleventyConfig) {
  nunjucks(eleventyConfig)

  eleventyConfig.addPlugin(syntaxHighlight)
  eleventyConfig.addPlugin(pluginRss)
  eleventyConfig.addPassthroughCopy('src/assets')
  eleventyConfig.addPassthroughCopy('src/favicon.ico')
  eleventyConfig.addPassthroughCopy('src/.well-known')

  eleventyConfig.addFilter('cssmin', function (code) {
    return new CleanCSS({}).minify(code).styles
  })

  return {
    passthroughFileCopy: true,
  }
}

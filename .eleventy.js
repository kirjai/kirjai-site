const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const CleanCSS = require('clean-css')

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
  eleventyConfig.addPassthroughCopy('src/assets')
  eleventyConfig.addPassthroughCopy('src/favicon.ico')

  eleventyConfig.addFilter('cssmin', function (code) {
    return new CleanCSS({}).minify(code).styles
  })

  return {
    passthroughFileCopy: true,
  }
}

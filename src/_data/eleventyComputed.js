// [label, url] pair
const filterTags = [
  ['react', 'react'],
  ['angular', 'angular'],
]

module.exports = () => ({
  currentYear: new Date().getFullYear(),
  filterTags: (data) => {
    const cleanUrl = data.page.url.replace(/\//g, '')
    const tags = filterTags.filter(([, url]) => cleanUrl !== url)

    if (data.page.url !== '/') {
      tags.unshift(['all', ''])
    }
    return tags
  },
})

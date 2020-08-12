var unified = require('unified')
var markdown = require('remark-parse')
var remark2rehype = require('remark-rehype')
var html = require('rehype-stringify')
const code = require('.')
const fs = require('fs')
const data = fs.readFileSync('./README.md')

var processor = unified()
  .use(markdown)
  .use(remark2rehype)
  .use(code, {theme: 'dark_plus'})
  .use(html)

// console.log(processor.process(data))
processor.process(data).then(c => {
  console.log(c.contents)
})

const fs = require('fs')
const path = require('path')

const target = path.join(process.cwd(), '.next', 'server', 'app', '(marketing)', 'page_client-reference-manifest.js')

if (!fs.existsSync(target)) {
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, 'module.exports = {}\n')
}

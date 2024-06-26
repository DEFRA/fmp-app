#!/usr/bin/env node

/* eslint-disable no-multi-str */
const exec = require('child_process').exec
const content =
  '\
<div id="content" class="wrapper">\
\r\t\t\t{{> beforeContent }}\
\r\t\t\t\t{{{content}}}\
\r\t\t\t{{> afterContent }}\
\r\t\t</div>'

/* eslint-disable */
const cmd = "sed -i'.bak' \
-e 's${{{ content }}}$" + content + "$g' \
-e 's${{{ topOfPage }}}${{> topOfPage }}$g' \
-e 's${{{ head }}}${{> head }}$g' \
-e 's${{{ bodyStart }}}${{> bodyStart }}$g' \
-e 's${{{ cookieMessage }}}${{> cookieMessage }}$g' \
-e 's${{{ insideHeader }}}${{> insideHeader }}$g' \
-e 's${{{ propositionHeader }}}${{> propositionHeader }}$g' \
-e 's${{{ afterHeader }}}${{> afterHeader }}$g' \
-e 's${{{ footerTop }}}${{> footerTop }}$g' \
-e 's${{{ footerSupportLinks }}}${{> footerSupportLinks }}$g' \
-e 's${{{ licenceMessage }}}${{> licenceMessage }}$g' \
-e 's${{{ bodyEnd }}}${{> bodyEnd }}$g' \
-e 's$<meta property=\"og:image\" content=\"{{{ assetPath }}}$<meta property=\"og:image\" content=\"{{{ siteUrl }}}{{{ assetPath }}}$g' \
server/views/layout.html && rm -f server/views/layout.html.bak"
/* eslint-enable */

exec(cmd, function (err) {
  if (err) {
    throw err
  }
})

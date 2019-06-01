const shiki = require('shiki')
const visit = require('unist-util-visit')
const {
  commonLangIds,
  commonLangAliases,
  otherLangIds
} = require('shiki-languages')
const hastToString = require('hast-util-to-string')
const u = require('unist-builder')

const languages = [...commonLangIds, ...commonLangAliases, ...otherLangIds]

module.exports = attacher

function attacher(options) {
  var settings = options || {}
  var theme = settings.theme || 'nord'
  var shikiTheme
  var highlighter

  try {
    shikiTheme = shiki.getTheme(theme)
  } catch (error) {
    shikiTheme = shiki.loadTheme(theme)
  }

  return transformer

  async function transformer(tree) {
    highlighter = await shiki.getHighlighter({
      theme: shikiTheme,
      langs: languages
    })
    visit(tree, 'element', visitor)
  }

  function visitor(node, index, parent) {
    if (!parent || parent.tagName !== 'pre' || node.tagName !== 'code') {
      return
    }

    addStyle(parent, 'background: ' + shikiTheme.bg)

    const lang = codeLanguage(node)

    if (!lang) {
      // Unknown language, fall back to a foreground colour
      addStyle(node, 'color: ' + shikiTheme.colors['terminal.foreground'])
      return
    }

    const tokens = highlighter.codeToThemedTokens(hastToString(node), lang)
    const tree = tokensToHast(tokens)

    node.children = tree
  }
}

function tokensToHast(lines) {
  let tree = []

  for (const line of lines) {
    if (line.length === 0) {
      tree.push(u('text', '\n'))
    } else {
      for (const token of line) {
        tree.push(
          u(
            'element',
            {
              tagName: 'span',
              properties: {style: 'color: ' + token.color}
            },
            [u('text', escapeHtml(token.content))]
          )
        )
      }

      tree.push(u('text', '\n'))
    }
  }

  return tree
}

function addStyle(node, style) {
  var props = node.properties || {}
  var styles = props.style || []
  styles.push(style)
  props.style = styles
  node.properties = props
}

function escapeHtml(html) {
  return html.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function codeLanguage(node) {
  const className = node.properties.className || []
  var value

  for (var i = 0; i < className.length; i++) {
    value = className[i]

    if (value.slice(0, 9) === 'language-') {
      return value.slice(9)
    }
  }

  return null
}

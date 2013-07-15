module.exports = comma_first_array

var find_tab_depth = require('../utils/find-tab-depth')
  , make_tabs = require('../utils/make-tabs')
  , subsource = require('../utils/source')

function comma_first_array(node, errors, warnings) {
  var nodes = node.elements.slice()
    , sub = subsource(node)
    , last_node
    , cur_node
    , str

  if(nodes.length === 0) {
    if(node.src !== '[]') {
      errors.push({
          line: node.start.line
        , message: 'empty arrays should be written `[]`'
      })
    }

    return
  }

  if(nodes[nodes.length - 1].start.line === node.start.line) {
    return
  }

  var depth = find_tab_depth(node)
    , tabs = make_tabs(depth)
    , is_first = true
    , adjust = 0
    , rex
    , idx

  last_node = node

  while(cur_node = nodes.shift()) {
    str = sub(
        is_first ? last_node.range[0] : last_node.range[1]
      , cur_node.range[0]
    )

    if(is_first) {
      rex = new RegExp('^\\[\\s*\n\\s{'+(2 * depth + 2) +'}$')

      if(!rex.test(str)) {
        errors.push({
            line: cur_node.start.line
          , message: 'expected `[\\n'+make_tabs(depth + 1)+'    `, got `'+JSON.stringify(str).slice(1,-1)+'`'
        })
      }

      rex = new RegExp('^\\s*\\n\\s{'+(2 * depth) +'}, $')
    } else if(!rex.test(str)) {
      errors.push({
          line: cur_node.start.line
        , message: 'expected `'+JSON.stringify('\n'+tabs).slice(1, -1)+', `, got `'+JSON.stringify(str).slice(1, -1)+'`'
      })
    }

    last_node = cur_node
    is_first = false
  } 
}

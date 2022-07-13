const types = {
  INIT: 'INIT',
  MOUSE_TRACK: 'MOUSE_TRACK',
  CLICK: 'CLICK',
  PASTE: 'PASTE',
  SCROLL: 'SCROLL',
  SELECT: 'SELECT',
  INPUT2_CTRL_A: 'INPUT2_CTRL_A',
  INPUT2_CTRL_V: 'INPUT2_CTRL_V',
  INPUT2_CTRL_BACK: 'INPUT2_CTRL_BACK',
  INPUT2_CTRL_ENTER: 'INPUT2_CTRL_ENTER'
}

function request(type, data) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({type, data}, function(response) {
      resolve(response)
    })
  })
}

function getElementByXpath(path) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}
function getElementsByXpath(path) {
  const it = document.evaluate(path, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null)
  const items = []
  while(true) {
    const item = it.iterateNext()
    if (!item) {
      break
    }
    items.push(item)
  }
  return items
}
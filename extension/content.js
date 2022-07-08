const types = {
  INIT: 'INIT',
  MOUSE_TRACK: 'MOUSE_TRACK',
  CLICK: 'CLICK',
  PASTE: 'PASTE',
  SCROLL: 'SCROLL',
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

async function sendRequest(type, data) {
  const items = []
  const mouseMoveData = handleMouseMove.flush()
  if (mouseMoveData.length > 0) {
    items.push(request(types.MOUSE_TRACK, {lastActionTime, time: Date.now(), data: mouseMoveData}))
  }
  const scrollData = handleScroll.flush()
  if (scrollData.length > 0) {
    items.push(request(types.SCROLL, {lastActionTime, time: Date.now(), data: scrollData}))
  }
  items.push(request(type, data))
  const results = await Promise.all(items)
  console.log(JSON.stringify(results))
  return results
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

let mouseState = '';
let lastActionTime = Date.now();
let infos = [];
let ready = false;
let hovering = false;
// console.log('ready', ready);
// const deferList = [];

/**
 * load
 */
(function(){
  window.addEventListener('load', async e => {
    const resp = await sendRequest(types.INIT, {url: window.location.toString(), time: Date.now()})
    console.log(resp)
    lastActionTime = Date.now()
    ready = true
    loadEvents()

    function renderMouseState() {
      let el = null
      el = document.querySelector('#action-recorder-container')
      if (!el) {
        el = document.createElement('div')
        el.id = "action-recorder-container"
        document.body.append(el)
      }
      const txt = mouseState == 'mouse_move'? '鼠标正在移动': mouseState == 'scroll'? '鼠标正在滚动': '鼠标无动作'
      el.innerHTML = `<div style="position: fixed; top: 100px; right: 10px; padding: 10px 15px; color: white; background: blue;">${txt}</div>`
    }
    renderMouseState()
    setInterval(() => {
      let currentState = ''
      if (Date.now() - handleMouseMove.lastTime() <= 500) {
        currentState = 'mouse_move'
      } else if (Date.now() - handleScroll.lastTime() <= 500) {
        currentState = 'scroll'
      }
      if (currentState != mouseState) {
        mouseState = currentState
        renderMouseState()
      }
    }, 250);
  })
  request("INFO", null).then(data => {
    infos = data.data
    loadEvents()
  })

  function renderElementState() {
    let el = null
    el = document.querySelector('#action-recorder-container2')
    if (!el) {
      el = document.createElement('div')
      el.id = "action-recorder-container2"
      document.body.append(el)
    }
    const txt = hovering? '聚焦元素': '未选择'
    el.innerHTML = `<div style="position: fixed; top: 200px; right: 10px; padding: 10px 15px; color: white; background: red;">${txt}</div>`
  }

  function loadEvents() {
    if (infos.length == 0 || !ready) {
      return
    }
    const url = window.location.toString()
    const actualInfos = []
    for (const {pageUrl: urlRegex, xpath, type, id} of infos) {
      const regex = new RegExp(urlRegex)
      if (!regex.test(url)) {
        continue
      }
      console.log(urlRegex)
      actualInfos.push({xpath, type, id})
    }
    for (const {xpath, type, id} of actualInfos) {
      hookXpath(xpath, type, id)
    }
    if (deferList.length > 0) {
      const intv = setInterval(() => {
        const xpathOkList = []
        for (const {xpath, type, id} of deferList) {
          const els = getElementsByXpath(xpath)
          if (els.length == 0 || els[0].offsetHeight == 0) {
            continue
          }
          for (const el of els) {
            hookElement(el, type, id)  
          }
          xpathOkList.push(xpath)
        }
        for (const xpath of xpathOkList) {
          const idx = deferList.findIndex(p => p.xpath == xpath)
          deferList.splice(idx, 1)
        }
        if (deferList.length == 0) {
          clearInterval(intv)
        }
      }, 500);
    }
  }

  const deferList = []
  function hookElement(el, type, id) {
    // console.log(el)
    // console.log(deferList)
    if (type == 'button') {
      el.addEventListener('mouseenter', function(e) {
        hovering = true
        renderElementState()
      })
      el.addEventListener('mouseleave', function(e) {
        hovering = false
        renderElementState()
      })
      el.addEventListener('click', async function(e) {
        const resp = await sendRequest(types.CLICK, {id, time: Date.now()})
        lastActionTime = Date.now()
        console.log(resp)
      })
    } else if (type == 'input2') {
      el.addEventListener('mouseenter', function(e) {
        hovering = true
        renderElementState()
      })
      el.addEventListener('mouseleave', function(e) {
        hovering = false
        renderElementState()
      })
      el.addEventListener('keydown', async function(e) {
        const ctrlKey = e.ctrlKey || e.metaKey
        if(ctrlKey&&e.keyCode===86) {
          const resp = await sendRequest(types.INPUT2_CTRL_V, {time: Date.now(), id})
          lastActionTime = Date.now()
          console.log(resp)
          // console.log('Ctrl+V');
        } else if(ctrlKey&&e.keyCode===65) {
          const resp = await sendRequest(types.INPUT2_CTRL_A, {time: Date.now(), id})
          lastActionTime = Date.now()
          console.log(resp)
          // console.log('Ctrl+A');
        } else if (!ctrlKey&&e.keyCode===8) {
          const resp = await sendRequest(types.INPUT2_CTRL_BACK, {time: Date.now(), id})
          lastActionTime = Date.now()
          console.log(resp)
          // console.log('backspace')
        } else if (!ctrlKey&&e.keyCode===13) {
          const resp = await sendRequest(types.INPUT2_CTRL_ENTER, {time: Date.now(), id})
          lastActionTime = Date.now()
          console.log(resp)
          // console.log('enter')
        }
      })
    }
  }
  function hookXpath(xpath, type, id) {
    const els = getElementsByXpath(xpath)
    if (els.length == 0 || els[0].offsetHeight == 0) {
      deferList.push({xpath, type, id})
      return
    }
    for (const el of els) {
      hookElement(el, type, id)  
    }
  }
})()


/**
 * move move
 */
const handleMouseMove = (function(){
  let moves = []
  const mouseMoveRec = _.throttle(e => {
    const {pageX, pageY} = e
    moves.push({x: pageX, y: pageY, time: Date.now()})
  }, 200, {leading: true})
  
  window.addEventListener('mousemove', mouseMoveRec)

  return {
    flush() {
      const _moves = moves
      moves = []
      return _moves
    },
    lastTime() {
      if (moves.length == 0) {
        return 0
      }
      return moves[moves.length - 1].time
    }
  }
})()

/**
 * scroll
 */
const handleScroll = (function() {
  let scrolls = []
  const scrollRec = _.throttle(e => {
    const sc = document.documentElement.scrollTop
    scrolls.push({sc, time: Date.now()})
  }, 200, {leading: true})

  window.addEventListener('scroll', scrollRec)

  return {
    flush() {
      const _scrolls = scrolls
      scrolls = []
      return _scrolls
    },
    lastTime() {
      if (scrolls.length == 0) {
        return 0
      }
      return scrolls[scrolls.length - 1].time
    }
  }
})()


const types = {
  INIT: 'INIT',
  MOUSE_TRACK: 'MOUSE_TRACK',
  CLICK: 'CLICK',
  PASTE: 'PASTE',
  SCROLL: 'SCROLL'
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

let mouseState = '';
let lastActionTime = Date.now();
let infos = [];
let ready = false;
let hovering = false;

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
      actualInfos.push({el: getElementByXpath(xpath), type, id})
    }
    for (const {el, type, id} of actualInfos) {
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
          console.log(resp)
        })
      }
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


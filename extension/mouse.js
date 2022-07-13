let mouseState = 'mouse_move';

(function() {
  window.addEventListener('load', async e => {
    window.addEventListener('keydown', async function(e) {
      const ctrlKey = e.ctrlKey || e.metaKey
      if(ctrlKey && e.keyCode===66) {
        mouseState = 'scroll'
        renderMouseState()
        const mouseMoveData = handleMouseMove.flush()
        if (mouseMoveData.length > 0) {
          const resp = await request(types.MOUSE_TRACK, {lastActionTime, time: Date.now(), data: mouseMoveData})
          console.log(resp)
        }
        lastActionTime = Date.now()
        handleScroll.start()
        console.log('ctrl+b scroll enabled')
      } else if(ctrlKey && e.keyCode===75) {
        const scrollData = handleScroll.flush()
        if (scrollData.length > 0) {
          const resp = await request(types.SCROLL, {lastActionTime, time: Date.now(), data: scrollData})
          console.log(resp)
        }
        lastActionTime = Date.now()
        mouseState = 'mouse_move'
        renderMouseState()
        console.log('ctrl+k scroll ended')
      }
    })
    function renderMouseState() {
      let el = null
      el = document.querySelector('#action-recorder-container')
      if (!el) {
        el = document.createElement('div')
        el.id = "action-recorder-container"
        document.body.append(el)
      }
      const txt = mouseState == 'mouse_move'? '鼠标移动(ctrl+b/k 切换)': mouseState == 'scroll'? '鼠标滚动': ''
      el.innerHTML = `<div style="position: fixed; top: 100px; right: 10px; padding: 10px 15px; color: white; background: blue; z-index: 1000">${txt}</div>`
    }
    renderMouseState();
  })
})()
/**
 * move move
 */
 var handleMouseMove = (function(){
  let moves = []
  const mouseMoveRec = _.throttle(e => {
    if (mouseState != 'mouse_move') {
      return
    }
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
var handleScroll = (function() {
  let scrolls = []
  const scrollRec = _.throttle(e => {
    if (mouseState != 'scroll') {
      return
    }
    const sc = document.documentElement.scrollTop
    scrolls.push({sc, time: Date.now()})
  }, 200, {leading: true})

  return {
    start() {
      window.addEventListener('scroll', scrollRec)
    },
    flush() {
      window.removeEventListener('scroll', scrollRec)
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


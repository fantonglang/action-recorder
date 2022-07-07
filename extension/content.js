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
  const mouseMoveData = handleMouseMove.flush()
  if (mouseMoveData.length > 0) {
    await request(types.MOUSE_TRACK, mouseMoveData)
  }
  return await request(type, data)
}

/**
 * load
 */
(function(){
  window.addEventListener('load', async e => {
    const resp = await sendRequest(types.INIT, {url: window.location.toString(), time: Date.now()})
    console.log(resp)
  })
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
    }
  }
})()

window.addEventListener('scroll', e => console.log(e))
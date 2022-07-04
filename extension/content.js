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

window.addEventListener('load', async e => {
  const resp = await request(types.INIT, {url: window.location.toString()})
  console.log(resp)
})
async function sendRequest(type, data) {
  const items = []
  const mouseMoveData = handleMouseMove.flush()
  if (mouseMoveData.length > 0) {
    items.push(request(types.MOUSE_TRACK, {lastActionTime, time: Date.now(), data: mouseMoveData}))
  }
  items.push(request(type, data))
  const results = await Promise.all(items)
  // console.log(JSON.stringify(results))
  return results
}


var lastActionTime = Date.now();
let infos = [];
let ready = false;
let hovering = false;
// console.log('ready', ready);
const deferList = [];
const refreshLists = {};

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
  })
  request("INFO", null).then(data => {
    infos = data.data
    loadEvents()
  })

  function loadEvents() {
    if (infos.length == 0 || !ready) {
      return
    }
    const url = window.location.toString()
    const actualInfos = []
    // console.log(infos)
    for (const {pageUrl: urlRegex, xpath, type, id} of infos) {
      const regex = new RegExp(urlRegex)
      if (!regex.test(url)) {
        continue
      }
      // console.log(urlRegex)
      actualInfos.push({xpath, type, id})
    }
    // console.log(actualInfos)
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
          refreshLists[xpath] = {type, id, els}
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
    if (actualInfos.length > 0) {
      const rintv = setInterval(() => {
        for (const xpath in refreshLists) {
          const {type, id, els} = refreshLists[xpath]
          // get els based on xpath
          const new_els = getElementsByXpath(xpath)
          var hasNew = false
          for (const new_el of new_els) {
            if (els.indexOf(new_el) < 0) {
              hasNew = true
              hookElement(new_el, type, id)
            }
          }
          if (hasNew) {
            refreshLists[xpath].els = new_els
          }
        }
      }, 500);
    }
  }

  // const deferList = []
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
    } else if (type == 'input') {
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
      el.addEventListener('keydown', async function(e) {
        const ctrlKey = e.ctrlKey || e.metaKey
        if(ctrlKey&&e.keyCode===86) {
          const resp = await sendRequest(types.INPUT2_CTRL_V, {time: Date.now(), id})
          lastActionTime = Date.now()
          console.log(resp)
          // console.log('Ctrl+V');
        }
      })
    } else if (type == 'select') {
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
    refreshLists[xpath] = {type, id, els}
  }

  function renderElementState() {
    let el = null
    el = document.querySelector('#action-recorder-container2')
    if (!el) {
      el = document.createElement('div')
      el.id = "action-recorder-container2"
      document.body.append(el)
    }
    const txt = hovering? '聚焦元素': '未选择'
    el.innerHTML = `<div style="position: fixed; top: 200px; right: 10px; padding: 10px 15px; color: white; background: red; z-index: 1000">${txt}</div>`
  }
})()


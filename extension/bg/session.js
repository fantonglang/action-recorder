function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function _getSession() {
  return new Promise(resolve => {
    chrome.storage.local.get(['rec_session'], function(result) {
      resolve(result.rec_session)
    });
  })
}

function _setSession(session) {
  return new Promise(resolve => {
    chrome.storage.local.set({rec_session: session}, function() {
      resolve()
    });
  })
}

export async function getSession() {
  const s = await _getSession()
  return s??null
}

export async function newSession() {
  const s = uuidv4()
  await _setSession(s)
}

const FINISH_SESSION_URL = 'http://localhost:5001/finish_session'

export async function finishSession() {
  const s = await getSession()
  if (!s) {
    return
  }
  await _setSession(null)
  await fetch(FINISH_SESSION_URL, {
    method: 'POST',
    body: JSON.stringify({
      session_id: s,
    })
  })
}
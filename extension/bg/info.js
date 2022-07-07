export default async function info() {
  const resp = await fetch('http://localhost:5001/info')
  const json = await resp.json()
  await _setInfo(json)
}

function _setInfo(info) {
  return new Promise(resolve => {
    chrome.storage.local.set({info}, function() {
      resolve()
    });
  })
}
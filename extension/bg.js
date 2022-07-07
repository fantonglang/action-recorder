import loadPipeline from './bg/pipeline.js'
import { newSession, finishSession } from './bg/session.js'
import info from './bg/info.js'

chrome.runtime.onMessage.addListener((message, sender, reply) => {
  const pipeline = loadPipeline()
  pipeline({message, sender}, reply)
  return true
})

chrome.commands.onCommand.addListener((command) => {
  if (command == 'new_session') {
    newSession().then(() => {
      return info()
    }).then(() => {
      const queryOptions = {active: true, lastFocusedWindow: true}
      return chrome.tabs.query(queryOptions)
    }).then(tabs => {
      const tab = tabs[0]
      return chrome.tabs.reload(tab.id)
    })
    return
  } else if (command == 'finish_session') {
    finishSession()
    return
  }
  console.log(`Command "${command}" called`);
});
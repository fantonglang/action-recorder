import loadPipeline from './bg/pipeline.js'
import { newSession, finishSession } from './bg/session.js'

chrome.runtime.onMessage.addListener((message, sender, reply) => {
  const pipeline = loadPipeline()
  pipeline({message, sender}, reply)
  return true
})

chrome.commands.onCommand.addListener((command) => {
  if (command == 'new_session') {
    newSession()
    return
  } else if (command == 'finish_session') {
    finishSession()
    return
  }
  console.log(`Command "${command}" called`);
});
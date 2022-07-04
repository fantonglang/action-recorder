import loadPipeline from './bg/pipeline.js'

chrome.runtime.onMessage.addListener((message, sender, reply) => {
  const pipeline = loadPipeline()
  pipeline({message, sender}, reply)
  return true
})

chrome.commands.onCommand.addListener((command) => {
  console.log(`Command "${command}" called`);
});
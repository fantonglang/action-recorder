let recording = false
let scrollTops = []

export function startRecordScroll(ts, scrollTop) {
  scrollTops = [{ts, st: scrollTop}]
  recording = true
}

export function finishRecordScroll(ts, scrollTop) {
  scrollTops.push({ts, st: scrollTop})
  recording = false
}

export function scroll(ts, scrollTop) {
  scrollTops.push({ts, st: scrollTop})
}
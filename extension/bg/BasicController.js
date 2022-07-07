import BaseController from "./BaseController.js";
import { getSession } from "./session.js";

const REPORT_URL = 'http://localhost:5001/report'

export default class BasicController extends BaseController {
  async getSession() {
    const s = await getSession()
    if (!s) {
      throw new Error('NO_SESSION')
    }
    return s
  }
  async init(data) {
    const {time, ...others} = data
    await fetch(REPORT_URL, {
      method: 'POST',
      body: JSON.stringify({
        data: JSON.stringify(others),
        time,
        type: 'INIT',
        session: await this.getSession()
      })
    })
    return "OK"
  }
  async info(data) {
    return await _getInfo()
  }
  async click({id, time}) {
    await fetch(REPORT_URL, {
      method: 'POST',
      body: JSON.stringify({
        data: JSON.stringify({id}),
        time,
        type: 'CLICK',
        session: await this.getSession(),
        key_el_id: id
      })
    })
    return "OK_CLICK"
  }
  async mouse_track() {
    return "OK_MOUSE_TRACK"
  }
  async scroll() {
    return "OK_SCROLL"
  }
}

function _getInfo() {
  return new Promise(resolve => {
    chrome.storage.local.get(['info'], function(result) {
      resolve(result.info)
    });
  })
}
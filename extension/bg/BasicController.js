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
  async info() {
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
  async mouse_track({time, ...others}) {
    console.log('mouse_track', others)
    await fetch(REPORT_URL, {
      method: 'POST',
      body: JSON.stringify({
        data: JSON.stringify(others),
        time,
        type: 'MOUSE_TRACK',
        session: await this.getSession(),
      })
    })
    return "OK_MOUSE_TRACK"
  }
  async scroll({time, ...others}) {
    console.log('scroll', others)
    await fetch(REPORT_URL, {
      method: 'POST',
      body: JSON.stringify({
        data: JSON.stringify(others),
        time,
        type: 'SCROLL',
        session: await this.getSession(),
      })
    })
    return "OK_SCROLL"
  }
  async INPUT2_CTRL_V({time, id}) {
    await fetch(REPORT_URL, {
      method: 'POST',
      body: JSON.stringify({
        data: JSON.stringify({id}),
        time,
        type: 'INPUT2_CTRL_V',
        session: await this.getSession(),
        key_el_id: id
      })
    })
    return "OK_INPUT2_CTRL_V"
  }
  async INPUT2_CTRL_A({time, id}) {
    await fetch(REPORT_URL, {
      method: 'POST',
      body: JSON.stringify({
        data: JSON.stringify({id}),
        time,
        type: 'INPUT2_CTRL_A',
        session: await this.getSession(),
        key_el_id: id
      })
    })
    return "OK_INPUT2_CTRL_A"
  }
  async INPUT2_CTRL_BACK({time, id}) {
    await fetch(REPORT_URL, {
      method: 'POST',
      body: JSON.stringify({
        data: JSON.stringify({id}),
        time,
        type: 'INPUT2_CTRL_BACK',
        session: await this.getSession(),
        key_el_id: id
      })
    })
    return "OK_INPUT2_CTRL_BACK"
  }
  async INPUT2_CTRL_ENTER({time, id}) {
    await fetch(REPORT_URL, {
      method: 'POST',
      body: JSON.stringify({
        data: JSON.stringify({id}),
        time,
        type: 'INPUT2_CTRL_ENTER',
        session: await this.getSession(),
        key_el_id: id
      })
    })
    return "OK_INPUT2_CTRL_ENTER"
  }
}

function _getInfo() {
  return new Promise(resolve => {
    chrome.storage.local.get(['info'], function(result) {
      resolve(result.info)
    });
  })
}
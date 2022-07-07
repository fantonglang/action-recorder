import BaseController from "./BaseController.js";
import { getSession } from "./session.js";

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
    await fetch('http://localhost:5001/report', {
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
}
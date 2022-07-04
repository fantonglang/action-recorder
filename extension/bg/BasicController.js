import BaseController from "./BaseController.js";

export default class BasicController extends BaseController {
  async init(data) {
    await fetch('http://localhost:5001/report', {
      method: 'POST',
      body: {
        data,
        time,
        type: 'INIT'
      }
    })
    return "OK"
  }
}
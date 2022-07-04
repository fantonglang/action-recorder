export default class BaseController {
  setContext(request, response) {
    this.request = request
    this.response = response
  }
  reply(data) {
    this.response({type: "DATA", data})
  }
}
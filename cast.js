let smartcast = require('vizio-smart-cast');
class Controller {
  constructor(ip, auth_token){
    this.tv = new smartcast(ip);
    if(auth_token !== undefined){
      this.tv.pairing.useAuthToken(auth_token);
    }
  }
  async pair(request_pin){
    try {
      await this.tv.pairing.initiate();
    } catch (e) {
      console.log('Error initiating: ',e);
      process.exit(1);
    }
    const pin = await request_pin;
    let output;
    try {
      output = await this.tv.pairing.pair(pin);
    } catch (e) {
      console.log('error pairing: ',e);
      process.exit(2);
    }
    const token = output.ITEM.AUTH_TOKEN;
    return token;
  }
  async input_current(){
    let data = await this.tv.input.current();
    const currrent_input = data.ITEMS[0].VALUE;
    const list = await this.tv.input.list();
    for(let i = 0; i < list.ITEMS.length; i++){
      const device = list.ITEMS[i];
      if(device.NAME === currrent_input){
        return device.VALUE.NAME;
      }
    }
    return null;
  }
  async input_list(){
    let data = await this.tv.input.current();
    const currrent_input = data.ITEMS[0].VALUE;
    const list = await this.tv.input.list();
    let output = [];
    for(let i = 0; i < list.ITEMS.length; i++){
      const device = list.ITEMS[i];
      output.push({
        name: device.VALUE.NAME,
        internal_name: device.NAME,
        current: device.NAME === currrent_input
      });
    }
    return output;
  }
}


module.exports = Controller;

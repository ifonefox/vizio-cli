const smartcast = require('vizio-smart-cast');

class Controller {
  constructor(ip, auth_token, name){
    this.name = name
    this.tv = new smartcast(ip);
    if(auth_token !== undefined){
      this.tv.pairing.useAuthToken(auth_token);
    }
  }
  static discover(more_than_one){
    if(more_than_one === undefined){
      more_than_one = false;
    }
    return new Promise(resolve=>{
      const timeout = 1000;
      let list = [];
      smartcast.discover(item=>{
        if(more_than_one){
          list.push(item);
        } else {
          resolve([item]);
          return;
        }
      }, function(){},timeout);
      if(more_than_one){
        setTimeout(()=>{
          resolve(list);
        },timeout);
      }
    });
  }
  async pair(request_pin){
    try {
      await this.tv.pairing.initiate(this.name);
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
        return {name: device.VALUE.NAME, internal_name: currrent_input};
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
  async input_set(name){
    name = name.toLowerCase();
    let cur = await this.input_current();
    if(name !== cur.name.toLowerCase() && name !== cur.internal_name.toLowerCase()){
      await this.tv.input.set(name);
    }
  }
  async volume_up(ammount){
    let i = 0;
    while(i < ammount){
      i++;
      await this.tv.control.volume.up();
    }
  }
  async volume_down(ammount){
    let i = 0;
    while(i < ammount){
      i++;
      await this.tv.control.volume.down();
    }
  }
  async volume_set(value){
    // This is inefficient. Don't use this unless you REALLY want to set the exact volume.
    await this.volume_down(100);
    await this.volume_up(value);
  }
}

module.exports = Controller;

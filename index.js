let smartcast = require('vizio-smart-cast');
let readline = require('readline');

async function get_user_input(userprompt){
  return new Promise(resolve => {
    const i = readline.createInterface(process.stdin, process.stdout, null);
    i.question(userprompt, output=>{
      i.close();
      resolve(output);
    });
  });
}

async function pair(ip){
  let tv = new smartcast(ip);
  if (process.argv.length > 2){
    let token = process.argv[2];
    tv.pairing.useAuthToken(token);
    return tv;
  } else {
    try {
      await tv.pairing.initiate();
    } catch (e) {
      console.log('Error initiating: ',e);
      process.exit(1);
    }
    let pin = await get_user_input("PIN: ");
    let output;
    try {
      output = await tv.pairing.pair(pin);
    } catch (e) {
      console.log('error pairing: ',e);
      process.exit(2);
    }
    console.log('Auth Token: ',output.ITEM.AUTH_TOKEN);
    return tv;
  }
}
async function get_input_cur(tv){
  let data = await tv.input.current();
  return data.ITEMS[0].VALUE;
}
async function get_input_list(tv){
  const list = await tv.input.list();
  let output = {};
  for(let i = 0; i < list.ITEMS.length; i++){
    const device = list.ITEMS[i];
    output[device.VALUE.NAME] = device.NAME;
  }
  return output;
}
async function main(){
  const ip = process.env.SMARTCAST;
  let tv = await pair(ip);
  let list = await get_input_list(tv);
  let cur = await get_input_cur(tv);
  console.log('Devices: ');
  for(let name in list){
    if (cur === list[name]){
      console.log(`  ${name} (Current)`);
    } else {
      console.log(`  ${name}`);
    }
  }
  let selection = await get_user_input('Input Device name: ');
  console.log(selection);
  tv.input.set(selection);
}
main();

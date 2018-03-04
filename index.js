let readline = require('readline');
let smarttv = require('./cast.js');
let argv = require('yargs').argv;

async function get_user_input(userprompt){
  return new Promise(resolve => {
    const i = readline.createInterface(process.stdin, process.stdout, null);
    i.question(userprompt, output=>{
      i.close();
      resolve(output);
    });
  });
}
async function main(){
  let ip, token, viz;
  if(argv.ip !== undefined){
    ip = argv.ip;
  } else if(process.env.SMARTCAST_IP !== undefined){
    ip = process.env.SMARTCAST_IP;
  } else {
    ip = await get_user_input('IP: ');
  }
  if(argv.ip !== undefined){
    token = argv.token;
  } else if(process.env.SMARTCAST_IP !== undefined){
    token = process.env.SMARTCAST_TOKEN;
  }
  if(token === undefined){
    viz = new smarttv(ip);
    viz.pair(get_user_input("PIN: "));
  } else {
    viz = new smarttv(ip, token);
  }

  if(argv.selectInput !== undefined){
    viz.input_set(argv.selectInput);
  }

}
console.log(argv);
main();

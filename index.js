let readline = require('readline');
let smarttv = require('./cast.js');

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
  let viz = new smarttv(process.env.SMARTCAST_IP, process.env.SMARTCAST_TOKEN);
  console.log(await viz.input_current());
}
main();

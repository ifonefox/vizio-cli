#!/usr/bin/env node
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
async function list(viz){
  const list = await viz.input_list();
  console.log("Inputs:");
  for(let i = 0; i < list.length; i++){
    if(list[i].current){
      console.log(`  ${list[i].name} (Current)`);
    } else {
      console.log(`  ${list[i].name}`);
    }
  }
}
function device_print(device){
  console.log(`  TV: ${device.name}`);
  console.log(`      ${device.manufacturer} ${device.model}`);
  console.log(`  IP: ${device.ip}`);
}
async function main(){
  let ip, token, viz;
  if(argv.ip !== undefined){
    ip = argv.ip;
  } else if(process.env.SMARTCAST_IP !== undefined){
    ip = process.env.SMARTCAST_IP;
  } else {
    //ip = await get_user_input('IP: ');
    const devices = await smarttv.discover(true);
    if(devices.length == 0){
      console.log("Error: No VIZIO tvs found");
      return;
    } else if (devices.length == 1){
      const device = devices[0];
      ip = device.ip;
      device_print(device);
    } else {
      for(let i = 0; i < devices.length; i++){
        console.log(`${i}:`);
        device_print(devices[i]);
      }
      const answer = await get_user_input("Enter device number: ");
      ip = devices[parseInt(answer)].ip;
    }
  }
  if(argv.ip !== undefined){
    token = argv.token;
  } else if(process.env.SMARTCAST_IP !== undefined){
    token = process.env.SMARTCAST_TOKEN;
  }
  if(token === undefined){
    viz = new smarttv(ip);
    await viz.pair(get_user_input("PIN: "));
  } else {
    viz = new smarttv(ip, token);
  }

  if(argv.input !== undefined){
    if(argv.input === true){
      await list(viz);
    } else {
      await viz.input_set(argv.input);
    }
  }
  if(argv.volumeUp !== undefined){
    if(argv.volumeUp === true){
      await viz.volume_up(1);
    } else {
      await viz.volume_up(parseInt(argv.volumeUp));
    }
  }
  if(argv.volumeDown !== undefined){
    if(argv.volumeDown === true){
      await viz.volume_down(1);
    } else {
      await viz.volume_down(parseInt(argv.volumeDown));
    }
  }
  if(argv.volume !== undefined && argv.volume !== true){
    await viz.volume_set(parseInt(argv.volume));
  }
}
main();

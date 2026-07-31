#!/usr/bin/env node 

import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import util from "util";
import packageJson from "../package.json" with {type: "json"};
import helper from "./helper/helper.js";
import color from "./helper/color.js";
import EXT_MAP from "./helper/extentions.js";

const execPromise = util.promisify(exec);

let startTime = new Date();

function start() {
  const args = process.argv;
  const input = args[2];

  if (!input) {
    console.error("FlagError: unaccepted flag! use --help.");
    process.exit();
  }

  switch (input) {
    case "-r":
    case "--run":
      allFiles(input);
      break;

    case "-v":
    case "--version":
      console.log(`${color.bold}v${packageJson.version}`);
      break;

    case "--help":
      helper();
      break;

    case "-u":
    case "--update":
      updatePkg(packageJson.name);
      break;

    default:
      console.error(`FlagError: unaccepted flag! use --help`);
      break;
  }
  
}

start();

function updatePkg(pkg) {

  console.log("Updating...");

  exec(`npm install ${pkg}`, (error, stdout, stderr)=>{
    if (error) {
      console.log(`Update failed: ${error.message}`);
      process.exit(1);
    }

    if (stderr) {
      console.log(stderr);
    }

    console.log(stdout);
    console.log("Successfull updated! Please Restart the tool.");
    console.log("------------------------------");
  });
}


function allFiles() {
  exec("find . -type f", (error, stdout, stderr)=>{
    
    if (error) {
      console.error(`error executing command ${error.message}`);
      return;
    }

    if (stderr) {
      console.log(`stderr ${stderr}`);
      return;
    }

    const files = stdout.split('\n').filter(Boolean);

    getStats(files);

  });
}

async function getStats(files){
  const stats = {};

  for (const file of files) {

    const ext = path.extname(file);
    const lang = EXT_MAP[ext];

    if (!lang){
      continue;
    }

    try {
      const { size } = await fs.stat(file); // byte 

      if (!stats[lang]){ 
        stats[lang] = { lang, totalSize: 0 }
      }

      stats[lang].totalSize += size;

    } catch (e) {
      console.error(`Could not read ${file}`);
    }
  }
  console.log("Sizes in byte");
  console.log(stats);

  return Object.values(stats);
}


function calculation(bits) {

  let sizeInUnit = [];

  for (let i = 0; i < bits.length; i++) {
    let size = bits[i];

    if (size < 0) {
      continue;

    } else if (size >= 8 && size < 8192) {
      // byte
      let byte = `${(size / 8).toFixed(2)} byte`;
      sizeInUnit.push(byte);

    } else if (size < 8) {
      // bit
      let bit = `${(size)} bit`;
      sizeInUnit.push(bit);

    } else if (size >= 8192 && size < 8388608) { 
      // kilobyte
      let kb = `${(size / 8192).toFixed(2)} kb`;
      sizeInUnit.push(kb);

    } else if (size >= 8388608 && size < 8589934592) { 
      // megabyte
      let mb = `${(size / 8388608).toFixed(2)} mb`;
      sizeInUnit.push(mb);
      
    } else {
      // gb 
      let gb = `${(size / 8589934592).toFixed(2)} gb`;
      sizeInUnit.push(gb);
    }
    
  }

  return sizeInUnit;
}


let endTime = new Date();

console.log(`Done in ${endTime - startTime} ms`);

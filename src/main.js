#!/usr/bin/env node 

import readline from "readline";
import fs from "fs";
import { exec } from "child_process";
import util from "util";
import packageJson from "../package.json" with {type: "json"};
import helper from "./info/helper.js";

const execPromise = util.promisify(exec);

function getPath() {
  const args = process.argv;
  const input = args[2];

  if (!input) {
    console.error("FlagError: unaccepted flag! use --help.");
    process.exit();
  }

  switch (input) {
    case "-r":
      allFiles(input);
      break;

    case "--recursive":
      allFiles(input);
    break;

    case "-v" || "--version":
      console.log(`v${packageJson.version}`);

    case "--help":
      helper();

    default:
      console.error("FlagError: unaccepted flag! use --help");
      break;
  }
  
}

getPath();


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

    readFile(files);

  });
}

function readFile(files) {

  let fileName = [];

  files.forEach((file) => {
    exec(`cat ${file}`, (error, stdout)=>{
      if (error) {
        console.error(`error to read ${file}`);
        return;
      }

    });

    if (file.includes(".js")) {
      fileName.push("Javascript");

    } else if (file.includes(".c")){
      fileName.push("C");

    } else if (file.includes(".sh")) {
      fileName.push("Bash");
      
    } else if (file.includes(".py")) {
      fileName.push("Python");
      
    } else if (file.includes(".kt")) {
      fileName.push("Kotlin");
      
    }else if (file.includes(".cc") || file.includes(".cpp")) {
      fileName.push("C++");
      
    }
    else {
      console.log(`not a valid file ${file}`);  
    }


  });

  sizeOfFile(files);
}

async function sizeOfFile(files){
  
  let fileSize = [];

  for (let file of files) {

    try {
      const { stdout } = await execPromise(`wc -c < ${file}`);

      const bits = parseInt(stdout.trim(), 10);
      fileSize.push(bits);
    } catch (err) {
      console.error(`file error ${file}`);
      
    }

  }
  console.log(fileSize)
  calculation(fileSize);

}


function calculation(bits) {
  
  let sizeInUnit = [];

  for (let i = 0; i < bits.length; i++) {
    let size = bits[i];

    if (size < 8192) {
      // bit
      let bit = `${size} bit`;
      sizeInUnit.push(bit);

    } else if (size >= 8192 && size < 8388608) { 
      // kilobyte
      let kb = `${(size / 8192)} kb`;
      sizeInUnit.push(kb);

    } else if (size >= 8388608 && size < 8589934592) { 
      // megabyte
      let mb = `${(size / 8388608)} mb`;
      sizeInUnit.push(mb);
      
    }
    
  }

  console.log(sizeInUnit);
  console.log("done");
}



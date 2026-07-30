#!/usr/bin/env node 

import path from "path";
import { exec } from "child_process";
import util from "util";
import packageJson from "../package.json" with {type: "json"};
import helper from "./helper/helper.js";

const execPromise = util.promisify(exec);

function start() {
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

    case "-v" || "--version":
      console.log(`v${packageJson.version}`);

    case "--help":
      helper();
      break;

    case "-u" || "--update":
      updatePkg();
      break;

    default:
      console.error("FlagError: unaccepted flag! use --help");
      break;
  }
  
}

start();

function updatePkg(update) {

  console.log("Updating...");

  exec(`npm install ${packageJson.name}`, (error, stdout, stderr)=>{
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

    findLanguages(files);

  });
}

function findLanguages(files) {

  const fileName = [];
  const currentFile = [];

  for (const file of files) {
    
    if (path.extname(file) === ".js") {
      fileName.push("Javascript");
      currentFile.push(file);

    } else if (path.extname(file) === ".c"){
      fileName.push("C");
      currentFile.push(file);

    } else if (path.extname(file) === ".sh") {
      fileName.push("Bash");
      currentFile.push(file);
      
    } else if (path.extname(file) === ".py") {
      fileName.push("Python");
      currentFile.push(file);
      
    } else if (path.extname(file) === ".kt") {
      fileName.push("Kotlin");
      currentFile.push(file);
      
    } else if (path.extname(file) === ".cc" || path.extname(file) === ".cpp") {
      fileName.push("C++");
      currentFile.push(file);
      
    } else if (path.extname(file) === ".html") {
      fileName.push("Html");
      currentFile.push(file);
      
    } else if (path.extname(file) === ".css") {
      fileName.push("Css");
      currentFile.push(file); 
      
    } else if (path.extname(file) === ".rs") {
      fileName.push("Rust");
      currentFile.push(file);
      
    } else if (path.extname(file) === ".lua") {
      fileName.push("Lua");
      currentFile.push(file);
      
    } 
    else {
      console.log(`skip the file: ${file}`);
      continue;
    }

  }

  console.log(fileName)

  sizeOfFile(currentFile);
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
      console.log(bit);
      sizeInUnit.push(bit);

    } else if (size >= 8 && size < 8192) {
      // byte
      let byte = `${(size / 8)}`;
      sizeInUnit.push(byte);

    } else if (size >= 8192 && size < 8388608) { 
      // kilobyte
      let kb = `${(size / 8192)} kb`;
      console.log(kb)
      sizeInUnit.push(kb);

    } else if (size >= 8388608 && size < 8589934592) { 
      // megabyte
      let mb = `${(size / 8388608)} mb`;
      sizeInUnit.push(mb);
      
    }
    
  }

  console.log(sizeInUnit);
}



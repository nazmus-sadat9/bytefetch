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

const args = process.argv;
const input = args[2];
const sizeUnit = args[3];

function start() {

  if (!input) {
    console.error(`${color.gray}FlagError: unaccepted flag! use --help`);
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
      console.error(`${color.gray}FlagError: unaccepted flag! use --help`);
      break;
  }

}

function getSizeObj(data) {

  if (!sizeUnit) {
    sizeInByte(data);
    percents(data);

  }

  switch (sizeUnit) {
    case "-kb":
      sizeInKb(data);
      percents(data);
      break;
    
    case "-mb":
      sizeInMb(data);
      percents(data);
      break;

  }
}

start();

function updatePkg(pkg) {

  console.log("Updating...");

  exec(`npm install ${pkg}`, (error, stdout, stderr)=>{
    if (error) {
      console.log(`${color.gray}Update failed: ${error.message}`);
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
      console.error(`${color.gray}error executing command ${error.message}`);
      return;
    }

    if (stderr) {
      console.log(`${color.gray}stderr ${stderr}`);
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
      console.error(`${color.gray}Could not read ${file}`);
    }
  }
  
  getSizeObj(stats);

  return Object.values(stats);
}


// size in byte format  (default)
function sizeInByte(data){

  let totalByte = 0;

  for (let [key, value] of Object.entries(data)) {

    // total size of byte
    totalByte = totalByte += value.totalSize;

    console.log(`${color.brightCyan}${value.lang}: [ ${value.totalSize} byte ]`);
  }

  console.log(`${color.brightYellow}Total: [ ${totalByte} byte ]`);
}

// size in kb format
function sizeInKb(data) {

  let totalKb = 0;

  for (let [key, value] of Object.entries(data)) {

    // total size of kb
    totalKb = totalKb += (value.totalSize / 1024);

    console.log(`${color.brightCyan}${value.lang}: [ ${(value.totalSize / 1024).toFixed(2)} kb ]`);
  }

  console.log(`${color.brightYellow}Total: [ ${totalKb.toFixed(2)} kb ]`);
}

// size in mb format
function sizeInMb(data) {

  let totalMb = 0;

  for (let [key, value] of Object.entries(data)) {

    // total size of mb
    totalMb = totalMb += (value.totalSize / 1048576);

    console.log(`${color.brightCyan}${value.lang}: [ ${(value.totalSize / 1048576).toFixed(2)} mb ]`);
  }

  console.log(`${color.brightYellow}Total: [ ${totalMb.toFixed(2)} mb ]`);
}

// percents of used languages
function percents(data) {

  let total = 0;

  for (let [key, value] of Object.entries(data)) {
    total = total += value.totalSize;

  }

  if (total === 0) {
    return;
  }

  for (const [key, value] of Object.entries(data)) {

    let percentage = (value.totalSize / total) * 100;

    console.log(`${color.brightGreen}${value.lang}: [ ${percentage.toFixed(2)}% ]`);
  }
}

let endTime = new Date();

console.log(`Done in ${endTime - startTime} ms`);

#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import packageJson from "../package.json" with {type: "json"};
import helper from "./helper/helper.js";
import color from "./helper/color.js";
import EXT_MAP from "./helper/extentions.js";

let startTime = new Date();

// get command line input
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
      allFiles();
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

  exec(`npm install ${pkg}`, (error, stdout, stderr) => {
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

// recursively find the files
async function walk(dir, files = []) {
  let entries;

  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (e) {
    console.error(`${color.gray}Could not read directory ${dir}: ${e.message}`);
    return files;
  }

  for (const entry of entries) {
    
    // skip the development files
    if (entry.isDirectory() && (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".next")) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath, files);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

// entry function
async function allFiles() {
  try {
    const files = await walk(".");
    await getStats(files);
  } catch (e) {
    console.error(`${color.gray}Error scanning directory: ${e.message}`);
  }
}

// find the languages
async function getStats(files) {
  const stats = {};

  for (const file of files) {

    const ext = path.extname(file);
    const lang = EXT_MAP[ext];

    if (!lang) {
      continue;
    }

    try {
      const { size } = await fs.stat(file); // byte

      if (!stats[lang]) {
        stats[lang] = { lang, totalSize: 0 };
      }

      stats[lang].totalSize += size;

    } catch (e) {
      console.error(`${color.gray}Could not read ${file}`);
    }
  }

  getSizeObj(stats);

  return Object.values(stats);
}

// size in byte format (default)
function sizeInByte(data) {

  let totalByte = 0;

  for (let [key, value] of Object.entries(data)) {
    totalByte = totalByte += value.totalSize;
    console.log(`${color.brightCyan}${value.lang}: [ ${value.totalSize} byte ]`);
  }

  console.log(`${color.brightYellow}Total: [ ${totalByte} byte ]`);
}

// size in kb format
function sizeInKb(data) {

  let totalKb = 0;

  for (let [key, value] of Object.entries(data)) {
    totalKb = totalKb += (value.totalSize / 1024);
    console.log(`${color.brightCyan}${value.lang}: [ ${(value.totalSize / 1024).toFixed(2)} kb ]`);
  }

  console.log(`${color.brightYellow}Total: [ ${totalKb.toFixed(2)} kb ]`);
}

// size in mb format
function sizeInMb(data) {

  let totalMb = 0;

  for (let [key, value] of Object.entries(data)) {
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


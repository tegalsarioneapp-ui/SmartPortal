import { readFileSync } from "fs";
const lines = readFileSync("artifacts/smart-portal-rt/index.html", "utf8").split("\n");
lines.slice(5208, 5220).forEach((l, i) => console.log("L" + (5209+i) + ": " + JSON.stringify(l)));
const fs = require("fs");
const path = require("path");

const mode = process.argv[2];

if (!["staging", "production"].includes(mode)) {
  console.error("Usage: node scripts/prepare-build.js <staging|production>");
  process.exit(1);
}

const srcPath = path.join(__dirname, "..", `.env.${mode}`);
const dstPath = path.join(__dirname, "..", ".env");

if (!fs.existsSync(srcPath)) {
  console.error(`[prepare-build] Source file not found: ${srcPath}`);
  process.exit(1);
}

const content = fs.readFileSync(srcPath, "utf8");
fs.writeFileSync(dstPath, content);
console.log(`[prepare-build] .env -> ${mode} (copied from .env.${mode})`);

const fs = require("fs");
const path = require("path");

const mode = process.argv[2];

if (!["staging", "production"].includes(mode)) {
  console.error("Usage: node scripts/prepare-build.js <staging|production>");
  process.exit(1);
}

const envPath = path.join(__dirname, "..", ".env");
const easPath = path.join(__dirname, "..", "eas.json");

// 1. Swap API URLs in .env
let env = fs.readFileSync(envPath, "utf8");

const stagingUrl = "https://api.staging.ziona.app";
const prodUrl = "https://api.ziona.app";

env = env.replace(
  /^EXPO_PUBLIC_API_BASE_URL=.*$/m,
  `EXPO_PUBLIC_API_BASE_URL=${mode === "production" ? prodUrl : stagingUrl}`
);
env = env.replace(
  /^EXPO_PUBLIC_GRAPHQL_URL=.*$/m,
  `EXPO_PUBLIC_GRAPHQL_URL=${mode === "production" ? prodUrl + "/graphql" : stagingUrl + "/graphql"}`
);

fs.writeFileSync(envPath, env);
console.log(`[prepare-build] .env -> ${mode} API URLs`);

// 2. Swap Android track in eas.json
const eas = JSON.parse(fs.readFileSync(easPath, "utf8"));
eas.submit.production.android.track = mode === "production" ? "production" : "internal";
fs.writeFileSync(easPath, JSON.stringify(eas, null, 2));
console.log(`[prepare-build] eas.json -> Android track: ${eas.submit.production.android.track}`);

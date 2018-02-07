#!/usr/bin/env node

const child_process = require("child_process");
const fs = require("fs-extra");
const path = require("path");

const pwdify = relativePath => path.resolve(__dirname, relativePath);

// just take first two args off for now ("node" and "cli.js")
const argv = process.argv.slice(2);

const directoryName = argv[0];

if (fs.existsSync(pwdify(directoryName))) {
  throw new Error(`${directoryName} already exists!`);
  process.exit();
}

console.log(`Cloning into ${directoryName}...`);

child_process.execSync(`git clone git@github.com:parkroolucas/react-app-starter ${directoryName}`);

if (!fs.existsSync(pwdify(directoryName))) {
  console.log("Something went wrong...");
  process.exit();
}

console.log(`Clone successful! Cleaning up...`);

(async () => {
  await Promise.all([
    fs.remove(pwdify(`${directoryName}/.git`)),
    fs.remove(pwdify(`${directoryName}/package-lock.json`)),
    (async () => {
      const packageJson = await fs.readJson(pwdify(`${directoryName}/package.json`));
      packageJson.name = directoryName;
      packageJson.description = "";
      packageJson.repository.url = `git+https://github.com/???/${directoryName}.git`;
      packageJson.author = "";

      await fs.writeJson(pwdify(`${directoryName}/package.json`), packageJson, {
        spaces: 2
      });
    })()
  ]);

  process.exit();
})();

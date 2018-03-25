#!/usr/bin/env node

const child_process = require("child_process");
const fs = require("fs-extra");
const path = require("path");

const pwdify = relativePath => path.resolve(process.cwd(), relativePath);

// just take first two args off for now ("node" and "cli.js")
const argv = process.argv.slice(2);

const directoryName = argv[0];

if (fs.existsSync(pwdify(directoryName))) {
  console.log(`${directoryName} already exists!`);
  process.exit();
}

child_process.execSync(`git clone git@github.com:parkroolucas/react-app-starter ${directoryName}`);

if (!fs.existsSync(pwdify(directoryName))) {
  console.log("Something went wrong...");
  process.exit();
}

console.log(`Clone successful! Cleaning up and installing dependencies...`);

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

      child_process.execSync(`cd ${directoryName} && npm i`);
    })()
  ]);

  process.exit();
})();

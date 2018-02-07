#!/usr/bin/env node

const child_process = require("child_process");
const fs = require("fs-extra");
const path = require("path");

const cwdify = relativePath => path.resolve(process.cwd(), relativePath);

// just take first two args off for now ("node" and "cli.js")
const argv = process.argv.slice(2);

const directoryName = argv[0];

if (fs.existsSync(cwdify(directoryName))) {
  console.log(`${directoryName} already exists!`);
  process.exit();
}

child_process.execSync(`git clone git@github.com:parkroolucas/react-app-starter ${directoryName}`);

if (!fs.existsSync(cwdify(directoryName))) {
  console.log("Something went wrong...");
  process.exit();
}

console.log(`Clone successful! Cleaning up...`);

(async () => {
  await Promise.all([
    fs.remove(cwdify(`${directoryName}/.git`)),
    fs.remove(cwdify(`${directoryName}/package-lock.json`)),
    (async () => {
      const packageJson = await fs.readJson(cwdify(`${directoryName}/package.json`));
      packageJson.name = directoryName;
      packageJson.description = "";
      packageJson.repository.url = `git+https://github.com/???/${directoryName}.git`;
      packageJson.author = "";

      await fs.writeJson(cwdify(`${directoryName}/package.json`), packageJson, {
        spaces: 2
      });
    })()
  ]);

  process.exit();
})();

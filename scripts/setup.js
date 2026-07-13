const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = process.cwd();
const packageJson = path.join(root, "package.json");

if (!fs.existsSync(packageJson)) {
  console.error("package.json non trovato nella cartella corrente.");
  process.exit(1);
}

const sleep = (ms) => {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
};

const removePath = (target) => {
  if (!fs.existsSync(target)) return;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      fs.rmSync(target, {
        recursive: true,
        force: true,
        maxRetries: 10,
        retryDelay: 200
      });
      return;
    } catch (error) {
      if (attempt === 4) {
        const renamed = `${target}.old-${Date.now()}`;
        fs.renameSync(target, renamed);
        try {
          fs.rmSync(renamed, {
            recursive: true,
            force: true,
            maxRetries: 10,
            retryDelay: 200
          });
        } catch {
          console.warn(`Pulizia differita: ${path.basename(renamed)} verra ignorato.`);
        }
        return;
      }
      sleep(300);
    }
  }
};

for (const item of ["node_modules"]) {
  removePath(path.join(root, item));
}

const command = process.platform === "win32" ? "npm.cmd" : "npm";
const result = spawnSync(command, ["install"], {
  cwd: root,
  stdio: "inherit"
});

process.exit(result.status ?? 1);

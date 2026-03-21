const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const root = __dirname;

// ts-prune lives in node_modules (workspace-hoisted from client); bare `ts-prune`
// is not on PATH outside npm scripts — use npx from each package root.
const runTsPrune = (subdir) =>
  execSync("npx ts-prune", {
    cwd: path.join(root, subdir),
    encoding: "utf-8",
  });

const clientOutput = runTsPrune("client");
const serverOutput = runTsPrune("server");

const filterOutput = (output, prefix) => {
  return output
    .split("\n")
    .filter((line) => {
      if (!line.trim()) return false;

      const [filePath, ...rest] = line.split(":");

      // Ignore files in the dist directory
      if (filePath.startsWith("dist/")) return false;

      // Ignore index files
      if (path.basename(filePath) === "index.ts") return false;

      // Ignore default export from vite config file
      if (path.basename(filePath) === "vite.config.ts") return false;

      // Ignore test and spec files
      if (filePath.includes(".test.") || filePath.includes(".spec."))
        return false;

      // Ignore type definition files
      if (filePath.endsWith(".d.ts")) return false;

      // Ignore default exports from component files
      if (
        filePath.includes("/components/") &&
        rest.join(":").includes("default")
      )
        return false;

      // Ignore default export from App file
      if (filePath.includes("src/App.tsx")) return false;

      return true;
    })
    .map((line) => `${prefix}: ${line}`)
    .join("\n");
};

const filteredClientOutput = filterOutput(clientOutput, "Client");
const filteredServerOutput = filterOutput(serverOutput, "Server");

const combinedOutput = `${filteredClientOutput}\n${filteredServerOutput}`;

console.log(combinedOutput);

// Write the filtered results to a file
fs.writeFileSync("unused-exports.txt", combinedOutput);

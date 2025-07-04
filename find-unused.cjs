const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Run ts-prune for both client and server
const clientOutput = execSync("cd client && ts-prune", { encoding: "utf-8" });
const serverOutput = execSync("cd server && ts-prune", { encoding: "utf-8" });

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

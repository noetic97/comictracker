const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Run ts-prune
const output = execSync("ts-prune", { encoding: "utf-8" });

// Filter the output
const filteredOutput = output
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
    if (filePath.includes("/components/") && rest.join(":").includes("default"))
      return false;

    // Ignore default export from App file
    if (filePath.includes("src/App.tsx")) return false;

    return true;
  })
  .join("\n");

console.log(filteredOutput);

// Write the filtered results to a file
fs.writeFileSync("unused-exports.txt", filteredOutput);

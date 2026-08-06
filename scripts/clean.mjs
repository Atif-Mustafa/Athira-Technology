import { rm } from "node:fs/promises";

const generatedDirectories = [
  ".next",
  "build",
  "coverage",
  "dist",
  "playwright-report",
  "test-results",
];

await Promise.all(
  generatedDirectories.map((directory) =>
    rm(directory, { recursive: true, force: true }),
  ),
);

console.log(`Removed generated directories: ${generatedDirectories.join(", ")}`);

import fs from "fs";
import fse from "fs-extra";
import path from "path";
import { promisify } from "util";
import { exec } from "child_process";

const buildChunkSize = 100;

const execAsync = promisify(exec);

function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

async function copyDirectoryContents(sourceDir, destDir) {
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  await fse.ensureDir(destDir); // Make sure the destination directory exists
  for (const entry of entries) {
    const srcPath = path.join(sourceDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await copyDirectoryContents(srcPath, destPath); // Recursive call for directories
    } else {
      await fse.copy(srcPath, destPath, { overwrite: true });
    }
  }
}

async function main() {
  const sourceDir = "./data";
  const blogDir = "./src/content/blog";
  const distDir = "/tmp/dist";

  const allFiles = fs
    .readdirSync(sourceDir)
    .filter((file) => file.endsWith(".mdx") || file === "index.astro");
  console.log(`Found ${allFiles.length} mdx files in ${sourceDir}.`);

  const fileChunks = chunkArray(allFiles, buildChunkSize);
  console.log(`Chunked files into ${fileChunks.length} groups.`);

  for (let i = 0; i < fileChunks.length; i++) {
    const chunk = fileChunks[i];
    const chunkNum = i + 1;
    console.log(
      `Processing chunk ${chunkNum}/${fileChunks.length} with ${chunk.length} files.`
    );

    await fse.emptyDir(blogDir);
    console.log(`Cleared ${blogDir}.`);

    for (const file of chunk) {
      const srcPath = `${sourceDir}/${file}`;
      const destPath = `${blogDir}/${file}`;
      await fse.copy(srcPath, destPath);
    }
    console.log(`Copied chunk ${chunkNum} files to ${blogDir}.`);

    await execAsync("npm run build");
    console.log("Build complete.");

    const chunkDistDir = `${distDir}_${chunkNum}`;
    await fse.copy("./dist", chunkDistDir);
    console.log(`Copied build files to ${chunkDistDir}.`);
  }

  await fse.emptyDir("./dist/blog");
  console.log("Prepared the final dist/blog directory.");

  for (let i = 1; i <= fileChunks.length; i++) {
    const chunkDistDir = `${distDir}_${i}/blog`;
    if (fs.existsSync(chunkDistDir)) {
      await copyDirectoryContents(chunkDistDir, "./dist/blog");
      console.log(`Merged files from ${chunkDistDir} into ./dist/blog.`);
    }
  }

  console.log(
    "Successfully merged all chunks into the final dist/blog directory."
  );
}

main().catch((error) => console.error("Error:", error));

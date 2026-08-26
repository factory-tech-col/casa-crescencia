import { readdir, stat, copyFile, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";

const SOURCE_DIR = "productos";
const DEST_DIR = "public/productos";

async function run() {
  let files;
  try {
    files = await readdir(SOURCE_DIR);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log(`Source directory "${SOURCE_DIR}" does not exist. Nothing to copy.`);
      process.exit(0);
    }
    console.error(`Failed to read source directory: ${err.message}`);
    process.exit(1);
  }

  const pngFiles = files.filter((f) => extname(f).toLowerCase() === ".png");

  if (pngFiles.length === 0) {
    console.log("No PNG files found in productos/. Nothing to copy.");
    process.exit(0);
  }

  try {
    await mkdir(DEST_DIR, { recursive: true });
  } catch (err) {
    console.error(`Failed to create destination directory: ${err.message}`);
    process.exit(1);
  }

  let copied = 0;
  for (const file of pngFiles) {
    const src = join(SOURCE_DIR, file);
    const dest = join(DEST_DIR, file);
    try {
      const fileStat = await stat(src);
      if (!fileStat.isFile()) continue;
      await copyFile(src, dest);
      console.log(`  copied: ${src} -> ${dest}`);
      copied++;
    } catch (err) {
      console.error(`  failed to copy ${src}: ${err.message}`);
    }
  }

  console.log(`\nDone. ${copied} file(s) copied to ${DEST_DIR}/`);
}

run();

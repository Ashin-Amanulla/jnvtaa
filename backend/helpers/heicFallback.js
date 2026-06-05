import { spawn } from "child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

function runCommand(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (err) => {
      if (err.code === "ENOENT") {
        reject(new Error(`${cmd} not available`));
        return;
      }
      reject(err);
    });

    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr.trim() || `${cmd} exited with code ${code}`));
    });
  });
}

function commandExists(cmd) {
  return new Promise((resolve) => {
    const child = spawn("which", [cmd], { stdio: "ignore" });
    child.on("close", (code) => resolve(code === 0));
    child.on("error", () => resolve(false));
  });
}

let magickAvailable;
let sipsAvailable;

async function hasMagick() {
  if (magickAvailable === undefined) {
    magickAvailable = await commandExists("magick");
  }
  return magickAvailable;
}

async function hasSips() {
  if (sipsAvailable === undefined) {
    sipsAvailable = process.platform === "darwin" && (await commandExists("sips"));
  }
  return sipsAvailable;
}

/**
 * Convert HEIC to JPEG using CLI tools when heic-convert runs out of memory
 * on very large iPhone photos (e.g. 16k wide panoramas).
 */
export async function convertHeicViaCli(buffer) {
  const dir = mkdtempSync(join(tmpdir(), "jnvtaa-heic-"));
  const inputPath = join(dir, "input.heic");
  const outputPath = join(dir, "output.jpg");

  try {
    writeFileSync(inputPath, buffer);

    if (await hasMagick()) {
      await runCommand("magick", [
        inputPath,
        "-resize",
        "1920x",
        "-quality",
        "92",
        outputPath,
      ]);
    } else if (await hasSips()) {
      await runCommand("sips", [
        "-s",
        "format",
        "jpeg",
        "-Z",
        "1920",
        inputPath,
        "--out",
        outputPath,
      ]);
    } else {
      throw new Error(
        "Large HEIC requires ImageMagick (magick) or macOS sips — install libheif/ImageMagick on the server",
      );
    }

    return readFileSync(outputPath);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { spawn } from "node:child_process";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { join } from "node:path";

// Correspondências revisadas manualmente pelo nome e tipo do movimento nas duas bibliotecas.
const matches = {
  "Barbell_Bench_Press_-_Medium_Grip": 73,
  Dumbbell_Bench_Press: 75,
  "Dips_-_Triceps_Version": 194,
  "EZ-Bar_Skullcrusher": 246,
  Front_Barbell_Squat: 257,
  Face_Pull: 222,
  Hammer_Curls: 272,
  Barbell_Hip_Thrust: 294,
  Side_Lateral_Raise: 348,
  Lying_Leg_Curls: 365,
  Leg_Press: 371,
  Pullups: 475,
  Romanian_Deadlift: 507,
  Seated_Cable_Rows: 512,
  Incline_Dumbbell_Press: 537,
  "Barbell_Incline_Bench_Press_-_Medium_Grip": 538,
  Dumbbell_Shoulder_Press: 567,
  Seated_Calf_Raise: 590,
  Standing_Calf_Raises: 622,
  Tricep_Dumbbell_Kickback: 655,
};

const catalogPath = "public/data/exercises.json";
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const response = await fetch(
  "https://wger.de/api/v2/exerciseinfo/?limit=2000&format=json",
);
if (!response.ok) throw new Error(`wger indisponível: ${response.status}`);
const info = new Map(
  (await response.json()).results.map((item) => [item.id, item]),
);
mkdirSync("public/videos", { recursive: true });
mkdirSync(".cache/videos", { recursive: true });

async function transcode(input, output) {
  await new Promise((resolve, reject) => {
    const child = spawn(
      "ffmpeg",
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        input,
        "-an",
        "-vf",
        "scale=960:-2:flags=lanczos,fps=25",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "28",
        "-movflags",
        "+faststart",
        "-t",
        "20",
        output,
      ],
      { stdio: "ignore" },
    );
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`ffmpeg saiu com código ${code}`)),
    );
  });
}

let cursor = 0;
let completed = 0;
const entries = Object.entries(matches);
async function worker() {
  while (cursor < entries.length) {
    const [id, wgerId] = entries[cursor++];
    const item = catalog.find((entry) => entry.id === id);
    const source = info.get(wgerId);
    if (!item || !source) continue;
    const video = source.videos
      .filter((entry) => entry.license === 2)
      .sort(
        (a, b) =>
          Number(b.codec === "h264") - Number(a.codec === "h264") ||
          Number(b.is_main) - Number(a.is_main),
      )[0];
    if (!video) continue;
    const output = join("public/videos", `${id}.mp4`);
    const input = join(".cache/videos", `${id}.mov`);
    try {
      if (!existsSync(output)) {
        if (!existsSync(input)) {
          const result = await fetch(video.video);
          if (!result.ok || !result.body)
            throw new Error(`download ${result.status}`);
          await pipeline(
            Readable.fromWeb(result.body),
            createWriteStream(input),
          );
        }
        await transcode(input, output);
      }
      item.video = {
        src: `/videos/${id}.mp4`,
        author: video.license_author || source.license_author || "wger",
        source: video.video,
        license: "CC BY-SA 4.0",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      };
      completed++;
      process.stdout.write(`Vídeo ${completed}/${entries.length}: ${id}\n`);
    } catch (error) {
      process.stderr.write(`Falha em ${id}: ${error.message}\n`);
    }
  }
}
await Promise.all([worker(), worker()]);
writeFileSync(catalogPath, JSON.stringify(catalog));
console.log(JSON.stringify({ videos: completed, total: entries.length }));

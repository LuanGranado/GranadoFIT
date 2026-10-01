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
  Barbell_Curl: 91,
  "Barbell_Bench_Press_-_Medium_Grip": 73,
  Barbell_Lunge: 46,
  Barbell_Walking_Lunge: 802,
  Dumbbell_Bench_Press: 75,
  Dumbbell_Lunges: 205,
  "Dips_-_Triceps_Version": 194,
  "EZ-Bar_Skullcrusher": 246,
  "Cable_Hammer_Curls_-_Rope_Attachment": 275,
  Front_Barbell_Squat: 257,
  Face_Pull: 222,
  Hammer_Curls: 272,
  Barbell_Hip_Thrust: 294,
  Side_Lateral_Raise: 348,
  Lying_Leg_Curls: 365,
  Lying_Dumbbell_Tricep_Extension: 245,
  Leg_Press: 371,
  Pullups: 475,
  Romanian_Deadlift: 507,
  Seated_Leg_Curl: 366,
  Seated_Cable_Rows: 512,
  Incline_Dumbbell_Press: 537,
  "Barbell_Incline_Bench_Press_-_Medium_Grip": 538,
  Dumbbell_Shoulder_Press: 567,
  Seated_Calf_Raise: 590,
  Smith_Machine_Squat: 341,
  Standing_Biceps_Cable_Curl: 95,
  Standing_Leg_Curl: 367,
  Standing_Calf_Raises: 622,
  Tricep_Dumbbell_Kickback: 655,
  Hack_Squat: 375,
  Machine_Shoulder_Military_Press: 543,
};

const catalogPath = "public/data/exercises.json";
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const mappedIds = new Set(Object.keys(matches));
catalog.forEach((item, index) => {
  if (!item.video?.source?.includes("wger.de") || mappedIds.has(item.id))
    return;
  delete item.video;
  const photoId = String(index).padStart(4, "0");
  item.image = existsSync(`public/exercises/${photoId}.jpg`)
    ? `/exercises/${photoId}.jpg`
    : null;
  item.image2 = existsSync(`public/exercises/${photoId}-2.jpg`)
    ? `/exercises/${photoId}-2.jpg`
    : null;
});
const response = await fetch(
  "https://wger.de/api/v2/exerciseinfo/?limit=2000&format=json",
);
if (!response.ok) throw new Error(`wger indisponível: ${response.status}`);
const info = new Map(
  (await response.json()).results.map((item) => [item.id, item]),
);
mkdirSync("public/videos", { recursive: true });
mkdirSync("public/videos/posters", { recursive: true });
mkdirSync(".cache/videos", { recursive: true });

async function runFfmpeg(args) {
  await new Promise((resolve, reject) => {
    const child = spawn(
      "ffmpeg",
      ["-hide_banner", "-loglevel", "error", "-y", ...args],
      {
        stdio: "ignore",
      },
    );
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`ffmpeg saiu com código ${code}`)),
    );
  });
}

async function transcode(input, output) {
  return runFfmpeg([
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
  ]);
}

async function captureFrame(input, seconds, output) {
  if (existsSync(output)) return;
  await runFfmpeg([
    "-ss",
    String(seconds),
    "-i",
    input,
    "-frames:v",
    "1",
    "-vf",
    "scale=960:-2:flags=lanczos",
    "-q:v",
    "3",
    output,
  ]);
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
      const poster = join("public/videos/posters", `${id}-1.jpg`);
      const second = join("public/videos/posters", `${id}-2.jpg`);
      await captureFrame(output, 5, poster);
      await captureFrame(output, 3, second);
      item.image = `/videos/posters/${id}-1.jpg`;
      item.image2 = `/videos/posters/${id}-2.jpg`;
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

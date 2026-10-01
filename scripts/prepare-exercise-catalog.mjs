import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { join } from "node:path";

const revision = "f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5";
const base = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/${revision}/`;
const ptRevision = "6bb9118e46cf8d0ee98b42e0285bae5036d04a19";
const ptUrl = `https://raw.githubusercontent.com/gugeldev/exercicios-bd-ptbr/${ptRevision}/exercises/exercises-ptbr-minimal.json`;
const imageDir = "public/exercises";
mkdirSync(imageDir, { recursive: true });
mkdirSync("public/data", { recursive: true });

const portugueseNames = {
  "Barbell_Bench_Press_-_Medium_Grip": "Supino reto com barra",
  Dumbbell_Bench_Press: "Supino reto com halteres",
  Incline_Dumbbell_Press: "Supino inclinado com halteres",
  Incline_Barbell_Bench_Press: "Supino inclinado com barra",
  Decline_Barbell_Bench_Press: "Supino declinado com barra",
  Butterfly: "Crucifixo na máquina",
  Dumbbell_Flyes: "Crucifixo com halteres",
  Cable_Crossover: "Crossover no cabo",
  Pushups: "Flexão de braço",
  "Push-Ups_-_Close_Triceps_Position": "Flexão fechada",
  Pullups: "Barra fixa",
  "Chin-Up": "Barra fixa supinada",
  "Wide-Grip_Lat_Pulldown": "Puxada frontal aberta",
  "Close-Grip_Front_Lat_Pulldown": "Puxada frontal fechada",
  Bent_Over_Barbell_Row: "Remada curvada com barra",
  "One-Arm_Dumbbell_Row": "Remada unilateral com halter",
  Seated_Cable_Rows: "Remada baixa no cabo",
  Deadlift: "Levantamento terra",
  Romanian_Deadlift: "Levantamento terra romeno",
  Barbell_Squat: "Agachamento livre com barra",
  Front_Barbell_Squat: "Agachamento frontal",
  Goblet_Squat: "Agachamento goblet",
  Bodyweight_Squat: "Agachamento com peso corporal",
  Leg_Press: "Leg press",
  Leg_Extensions: "Cadeira extensora",
  Lying_Leg_Curls: "Mesa flexora",
  Seated_Leg_Curl: "Cadeira flexora",
  Barbell_Lunge: "Avanço com barra",
  Dumbbell_Lunges: "Avanço com halteres",
  Bodyweight_Walking_Lunge: "Afundo caminhando",
  Glute_Bridge: "Ponte de glúteos",
  Barbell_Glute_Bridge: "Elevação pélvica com barra",
  Standing_Calf_Raises: "Panturrilha em pé",
  Seated_Calf_Raise: "Panturrilha sentado",
  Dumbbell_Shoulder_Press: "Desenvolvimento com halteres",
  Military_Press: "Desenvolvimento militar",
  Side_Lateral_Raise: "Elevação lateral",
  Front_Dumbbell_Raise: "Elevação frontal",
  Reverse_Flyes: "Crucifixo inverso",
  Barbell_Curl: "Rosca direta com barra",
  Dumbbell_Alternate_Bicep_Curl: "Rosca alternada",
  Hammer_Curls: "Rosca martelo",
  Concentration_Curls: "Rosca concentrada",
  Preacher_Curl: "Rosca Scott",
  Triceps_Pushdown: "Tríceps no cabo",
  "Triceps_Pushdown_-_Rope_Attachment": "Tríceps corda",
  Lying_Triceps_Press: "Tríceps testa",
  "Dips_-_Triceps_Version": "Mergulho para tríceps",
  Bench_Dips: "Tríceps banco",
  Plank: "Prancha",
  Crunches: "Abdominal tradicional",
  Hanging_Leg_Raise: "Elevação de pernas suspenso",
  Ab_Roller: "Abdominal com roda",
  Air_Bike: "Abdominal bicicleta",
  Mountain_Climbers: "Escalador",
  Burpees: "Burpee",
  Jumping_Jacks: "Polichinelo",
  Running_Treadmill: "Corrida na esteira",
  Walking_Treadmill: "Caminhada na esteira",
  Trail_Running_Walking: "Corrida ou caminhada ao ar livre",
  Stationary_Bike: "Bicicleta ergométrica",
  Jump_Rope: "Pular corda",
  Rowing_Stationary: "Remo ergométrico",
  Kettlebell_Halo: "Giro ao redor da cabeça com kettlebell",
  Kettlebell_Halo_With_Overhead_Extension:
    "Giro ao redor da cabeça com extensão de tríceps",
  Kettlebell_Overhead_Triceps_Extension:
    "Extensão de tríceps acima da cabeça com kettlebell",
  Around_The_Worlds: "Volta ao mundo com halteres",
  "Body-Up": "Flexão de tríceps saindo da prancha de antebraços",
  Circus_Bell: "Arremesso de halter grande",
  Clean: "Clean com barra (levantamento olímpico)",
  Cuban_Press: "Desenvolvimento cubano com halteres",
  Face_Pull: "Puxada para o rosto no cabo",
  Groiners: "Alongamento dinâmico de adutores",
  Iron_Cross: "Cruz de ferro com halteres",
  JM_Press: "Supino JM para tríceps",
  Landmine_180s: "Rotação 180° com barra landmine",
  Landmine_Linear_Jammer: "Desenvolvimento com barra landmine",
  Muscle_Up: "Subida nas argolas (muscle-up)",
  "Otis-Up": "Abdominal Otis com peso",
  Pallof_Press: "Press Pallof anti-rotação",
  Pull_Through: "Puxada entre as pernas no cabo",
  Push_Press: "Desenvolvimento com impulso",
  Snatch_Balance: "Equilíbrio no arranco",
  Step_Mill: "Subida de escadas na máquina",
};

const [response, translatedResponse] = await Promise.all([
  fetch(`${base}dist/exercises.json`),
  fetch(ptUrl),
]);
if (!response.ok || !translatedResponse.ok)
  throw new Error(
    `Catálogo indisponível: ${response.status}/${translatedResponse.status}`,
  );
const source = await response.json();
const translated = new Map(
  (await translatedResponse.json()).map((item) => [item.id, item]),
);
const existingVideos = existsSync("public/data/exercises.json")
  ? new Map(
      JSON.parse(readFileSync("public/data/exercises.json", "utf8"))
        .filter((item) => item.video)
        .map((item) => [item.id, item.video]),
    )
  : new Map();
const catalog = source.map((item, index) => ({
  id: item.id,
  name: portugueseNames[item.id] || translated.get(item.id)?.name || item.name,
  originalName: item.name,
  instructions: translated.get(item.id)?.instructions || [],
  primaryMuscles: item.primaryMuscles || [],
  secondaryMuscles: item.secondaryMuscles || [],
  equipment: item.equipment || "other",
  category: item.category || "strength",
  level: item.level || "beginner",
  image: item.images?.[0]
    ? `/exercises/${String(index).padStart(4, "0")}.jpg`
    : null,
  image2: item.images?.[1]
    ? `/exercises/${String(index).padStart(4, "0")}-2.jpg`
    : null,
  ...(existingVideos.has(item.id)
    ? { video: existingVideos.get(item.id) }
    : {}),
  imageSources:
    item.images?.slice(0, 2).map((path) => `${base}exercises/${path}`) || [],
}));

let cursor = 0;
let failures = 0;
async function worker() {
  while (cursor < catalog.length) {
    const index = cursor++;
    const item = catalog[index];
    for (let frame = 0; frame < item.imageSources.length; frame++) {
      const target = join(
        imageDir,
        `${String(index).padStart(4, "0")}${frame ? "-2" : ""}.jpg`,
      );
      if (existsSync(target)) continue;
      try {
        const result = await fetch(item.imageSources[frame]);
        if (!result.ok || !result.body) throw new Error(String(result.status));
        await pipeline(
          Readable.fromWeb(result.body),
          createWriteStream(target),
        );
      } catch {
        if (frame === 0) item.image = null;
        else item.image2 = null;
        failures++;
      }
    }
  }
}
await Promise.all(Array.from({ length: 16 }, worker));
for (const item of catalog) delete item.imageSources;
writeFileSync("public/data/exercises.json", JSON.stringify(catalog));
console.log(
  JSON.stringify({
    exercises: catalog.length,
    imageFailures: failures,
    translated: catalog.filter((item) => item.name !== item.originalName)
      .length,
    withSteps: catalog.filter((item) => item.instructions.length).length,
  }),
);

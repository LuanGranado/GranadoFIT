import { createWriteStream, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { join } from 'node:path'

const revision = 'f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5'
const base = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/${revision}/`
const imageDir = 'public/exercises'
mkdirSync(imageDir, { recursive: true })
mkdirSync('public/data', { recursive: true })

const portugueseNames = {
  'Barbell_Bench_Press_-_Medium_Grip': 'Supino reto com barra',
  'Dumbbell_Bench_Press': 'Supino reto com halteres',
  'Incline_Dumbbell_Press': 'Supino inclinado com halteres',
  'Incline_Barbell_Bench_Press': 'Supino inclinado com barra',
  'Decline_Barbell_Bench_Press': 'Supino declinado com barra',
  'Butterfly': 'Crucifixo na máquina',
  'Dumbbell_Flyes': 'Crucifixo com halteres',
  'Cable_Crossover': 'Crossover no cabo',
  'Pushups': 'Flexão de braço',
  'Push-Ups_-_Close_Triceps_Position': 'Flexão fechada',
  'Pullups': 'Barra fixa',
  'Chin-Up': 'Barra fixa supinada',
  'Wide-Grip_Lat_Pulldown': 'Puxada frontal aberta',
  'Close-Grip_Front_Lat_Pulldown': 'Puxada frontal fechada',
  'Bent_Over_Barbell_Row': 'Remada curvada com barra',
  'One-Arm_Dumbbell_Row': 'Remada unilateral com halter',
  'Seated_Cable_Rows': 'Remada baixa no cabo',
  'Deadlift': 'Levantamento terra',
  'Romanian_Deadlift': 'Levantamento terra romeno',
  'Barbell_Squat': 'Agachamento livre com barra',
  'Front_Barbell_Squat': 'Agachamento frontal',
  'Goblet_Squat': 'Agachamento goblet',
  'Bodyweight_Squat': 'Agachamento com peso corporal',
  'Leg_Press': 'Leg press',
  'Leg_Extensions': 'Cadeira extensora',
  'Lying_Leg_Curls': 'Mesa flexora',
  'Seated_Leg_Curl': 'Cadeira flexora',
  'Barbell_Lunge': 'Avanço com barra',
  'Dumbbell_Lunges': 'Avanço com halteres',
  'Bodyweight_Walking_Lunge': 'Afundo caminhando',
  'Glute_Bridge': 'Ponte de glúteos',
  'Barbell_Glute_Bridge': 'Elevação pélvica com barra',
  'Standing_Calf_Raises': 'Panturrilha em pé',
  'Seated_Calf_Raise': 'Panturrilha sentado',
  'Dumbbell_Shoulder_Press': 'Desenvolvimento com halteres',
  'Military_Press': 'Desenvolvimento militar',
  'Side_Lateral_Raise': 'Elevação lateral',
  'Front_Dumbbell_Raise': 'Elevação frontal',
  'Reverse_Flyes': 'Crucifixo inverso',
  'Barbell_Curl': 'Rosca direta com barra',
  'Dumbbell_Alternate_Bicep_Curl': 'Rosca alternada',
  'Hammer_Curls': 'Rosca martelo',
  'Concentration_Curls': 'Rosca concentrada',
  'Preacher_Curl': 'Rosca Scott',
  'Triceps_Pushdown': 'Tríceps no cabo',
  'Triceps_Pushdown_-_Rope_Attachment': 'Tríceps corda',
  'Lying_Triceps_Press': 'Tríceps testa',
  'Dips_-_Triceps_Version': 'Mergulho para tríceps',
  'Bench_Dips': 'Tríceps banco',
  'Plank': 'Prancha',
  'Crunches': 'Abdominal tradicional',
  'Hanging_Leg_Raise': 'Elevação de pernas suspenso',
  'Ab_Roller': 'Abdominal com roda',
  'Air_Bike': 'Abdominal bicicleta',
  'Mountain_Climbers': 'Escalador',
  'Burpees': 'Burpee',
  'Jumping_Jacks': 'Polichinelo',
  'Running_Treadmill': 'Corrida na esteira',
  'Walking_Treadmill': 'Caminhada na esteira',
  'Trail_Running_Walking': 'Corrida ou caminhada ao ar livre',
  'Stationary_Bike': 'Bicicleta ergométrica',
  'Jump_Rope': 'Pular corda',
  'Rowing_Stationary': 'Remo ergométrico',
}

const response = await fetch(`${base}dist/exercises.json`)
if (!response.ok) throw new Error(`Catálogo indisponível: ${response.status}`)
const source = await response.json()
const catalog = source.map((item, index) => ({
  id: item.id,
  name: portugueseNames[item.id] || item.name,
  originalName: item.name,
  primaryMuscles: item.primaryMuscles || [],
  secondaryMuscles: item.secondaryMuscles || [],
  equipment: item.equipment || 'other',
  category: item.category || 'strength',
  level: item.level || 'beginner',
  image: item.images?.[0] ? `/exercises/${String(index).padStart(4, '0')}.jpg` : null,
  image2: item.images?.[1] ? `${base}exercises/${item.images[1]}` : null,
  imageSource: item.images?.[0] ? `${base}exercises/${item.images[0]}` : null,
}))

let cursor = 0
let failures = 0
async function worker() {
  while (cursor < catalog.length) {
    const index = cursor++
    const item = catalog[index]
    if (!item.image || !item.imageSource) continue
    const target = join(imageDir, `${String(index).padStart(4, '0')}.jpg`)
    if (existsSync(target)) continue
    try {
      const result = await fetch(item.imageSource)
      if (!result.ok || !result.body) throw new Error(String(result.status))
      await pipeline(Readable.fromWeb(result.body), createWriteStream(target))
    } catch {
      item.image = null
      failures++
    }
  }
}
await Promise.all(Array.from({ length: 16 }, worker))
for (const item of catalog) delete item.imageSource
writeFileSync('public/data/exercises.json', JSON.stringify(catalog))
console.log(JSON.stringify({ exercises: catalog.length, imageFailures: failures, translated: Object.keys(portugueseNames).filter(id => source.some(item => item.id === id)).length }))

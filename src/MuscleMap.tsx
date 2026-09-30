import { muscleNames } from "./catalog";

type Props = { primary: string[]; secondary?: string[]; compact?: boolean };

const regions: { muscle: string; front?: string; back?: string }[] = [
  {
    muscle: "chest",
    front:
      "M30 27 Q39 23 48 28 L48 39 Q39 43 30 37Z M52 28 Q61 23 70 27 L70 37 Q61 43 52 39Z",
  },
  {
    muscle: "shoulders",
    front:
      "M26 24 Q18 25 15 35 L22 42 L30 29Z M74 24 Q82 25 85 35 L78 42 L70 29Z",
    back: "M26 24 Q18 25 15 35 L22 42 L30 29Z M74 24 Q82 25 85 35 L78 42 L70 29Z",
  },
  {
    muscle: "biceps",
    front: "M19 40 L26 43 L23 58 L17 56Z M74 43 L81 40 L83 56 L77 58Z",
  },
  {
    muscle: "triceps",
    back: "M19 40 L26 43 L23 58 L17 56Z M74 43 L81 40 L83 56 L77 58Z",
  },
  {
    muscle: "forearms",
    front: "M17 59 L23 61 L20 78 L13 76Z M77 61 L83 59 L87 76 L80 78Z",
    back: "M17 59 L23 61 L20 78 L13 76Z M77 61 L83 59 L87 76 L80 78Z",
  },
  { muscle: "abdominals", front: "M37 43 L63 43 L60 68 L40 68Z" },
  {
    muscle: "lats",
    back: "M29 32 L47 41 L43 62 L35 58Z M71 32 L53 41 L57 62 L65 58Z",
  },
  { muscle: "middle back", back: "M38 27 L62 27 L58 48 L50 43 L42 48Z" },
  { muscle: "lower back", back: "M42 49 L58 49 L62 66 L38 66Z" },
  {
    muscle: "traps",
    back: "M40 19 L50 25 L60 19 L72 29 L55 34 L45 34 L28 29Z",
  },
  {
    muscle: "quadriceps",
    front: "M35 73 L48 74 L46 107 L34 108Z M52 74 L65 73 L66 108 L54 107Z",
  },
  {
    muscle: "hamstrings",
    back: "M35 76 L48 78 L46 108 L34 109Z M52 78 L65 76 L66 109 L54 108Z",
  },
  {
    muscle: "glutes",
    back: "M34 68 Q42 65 49 69 L49 83 Q41 90 34 81Z M51 69 Q58 65 66 68 L66 81 Q59 90 51 83Z",
  },
  {
    muscle: "abductors",
    front: "M32 72 L39 75 L36 90 L31 87Z M61 75 L68 72 L69 87 L64 90Z",
  },
  {
    muscle: "adductors",
    front: "M43 76 L49 77 L48 98 L42 91Z M51 77 L57 76 L58 91 L52 98Z",
  },
  {
    muscle: "calves",
    front: "M34 113 L45 113 L43 137 L35 137Z M55 113 L66 113 L65 137 L57 137Z",
    back: "M34 113 L45 113 L43 137 L35 137Z M55 113 L66 113 L65 137 L57 137Z",
  },
  {
    muscle: "neck",
    front: "M45 16 L55 16 L57 25 L43 25Z",
    back: "M45 16 L55 16 L57 25 L43 25Z",
  },
];

function Figure({
  side,
  primary,
  secondary,
}: {
  side: "front" | "back";
  primary: string[];
  secondary: string[];
}) {
  return (
    <svg
      viewBox="0 0 100 150"
      role="img"
      aria-label={
        side === "front"
          ? "Vista frontal dos músculos"
          : "Vista posterior dos músculos"
      }
    >
      <path
        className="muscle-base"
        d="M44 4 Q50 0 56 4 L59 14 L56 20 L59 22 L72 22 Q83 23 87 34 L90 52 L88 79 L82 82 L77 60 L73 44 L70 69 L68 86 L67 111 L66 139 L58 145 L53 142 L51 113 L49 91 L47 113 L45 142 L38 145 L33 139 L32 111 L31 86 L30 69 L27 44 L23 60 L18 82 L12 79 L10 52 L13 34 Q17 23 28 22 L41 22 L44 20 L41 14Z"
      />
      {regions.map((region) => {
        const path = region[side];
        if (!path) return null;
        const status = primary.includes(region.muscle)
          ? "primary"
          : secondary.includes(region.muscle)
            ? "secondary"
            : "idle";
        return (
          <path
            key={region.muscle}
            d={path}
            className={`muscle-region ${status}`}
          />
        );
      })}
      <path
        className="muscle-outline"
        d="M44 4 Q50 0 56 4 L59 14 L56 20 L59 22 L72 22 Q83 23 87 34 L90 52 L88 79 L82 82 L77 60 L73 44 L70 69 L68 86 L67 111 L66 139 L58 145 L53 142 L51 113 L49 91 L47 113 L45 142 L38 145 L33 139 L32 111 L31 86 L30 69 L27 44 L23 60 L18 82 L12 79 L10 52 L13 34 Q17 23 28 22 L41 22 L44 20 L41 14Z"
      />
    </svg>
  );
}

export default function MuscleMap({
  primary,
  secondary = [],
  compact = false,
}: Props) {
  const names = primary.map((part) => muscleNames[part] || part).join(", ");
  return (
    <div
      className={`muscle-map ${compact ? "compact" : ""}`}
      aria-label={`Músculos principais: ${names}`}
    >
      <div className="muscle-figures">
        <Figure side="front" primary={primary} secondary={secondary} />
        <Figure side="back" primary={primary} secondary={secondary} />
      </div>
      {!compact && (
        <div className="muscle-legend">
          <span>
            <i className="legend-primary" /> Principal
          </span>
          <span>
            <i className="legend-secondary" /> Secundário
          </span>
        </div>
      )}
    </div>
  );
}

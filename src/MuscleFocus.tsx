import { muscleNames } from "./catalog";

type Props = { primary: string[]; secondary?: string[] };

function names(parts: string[]) {
  return [...new Set(parts)].map((part) => muscleNames[part] || part);
}

export default function MuscleFocus({ primary, secondary = [] }: Props) {
  const principal = names(primary);
  const auxiliary = names(secondary.filter((part) => !primary.includes(part)));

  return (
    <div className="muscle-focus">
      <div className="muscle-focus-group">
        <strong>Músculo principal</strong>
        <div className="muscle-focus-tags">
          {principal.length ? (
            principal.map((name) => (
              <span className="muscle-tag primary" key={name}>
                {name}
              </span>
            ))
          ) : (
            <span className="muscle-tag unknown">Não informado</span>
          )}
        </div>
      </div>
      {auxiliary.length > 0 && (
        <div className="muscle-focus-group">
          <strong>Também trabalha</strong>
          <div className="muscle-focus-tags">
            {auxiliary.map((name) => (
              <span className="muscle-tag secondary" key={name}>
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

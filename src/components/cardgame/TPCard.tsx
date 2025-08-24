import type { CSSProperties } from "react";
import type { Card } from "./types";
import { rankLabel } from "./deck";

export default function TPCard({
  t,
  facedown,
  onClick,
  disabled,
  highlight,
  style,
}: {
  t?: { card: Card; removed: boolean };
  facedown: boolean;
  onClick: () => void;
  disabled: boolean;
  highlight: boolean;
  style?: CSSProperties;
}) {
  if (!t) {
    return <div className="tp-card facedown disabled" style={style}></div>;
  }

  const cls = [
    "tp-card",
    facedown ? "facedown" : "faceup",
    disabled ? "disabled" : "",
    highlight && !disabled && !facedown ? "playable" : "",
    t.removed ? "removed" : "",
  ].filter(Boolean).join(" ");

  const label = !facedown && !t.removed ? `${rankLabel(t.card.rank)}${t.card.suit}` : "";

  return (
    <div
      className={cls}
      style={style}
      onClick={!disabled && !t.removed && !facedown ? onClick : undefined}
      role="button"
      aria-disabled={disabled || facedown || t.removed}
      aria-label={label}
      title={facedown ? "Covered" : label}
    >
      {label}
    </div>
  );
}

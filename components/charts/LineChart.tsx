import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";
import type { ChartDatum } from "@/types/chart";
import type { ChartPalette } from "./palette";
export function LineChart({
  data,
  palette,
  onSelect,
}: {
  data: ChartDatum[];
  palette: ChartPalette;
  onSelect?: (item: ChartDatum) => void;
}) {
  if (!data.length) return null;
  const width = 320,
    height = 190,
    pad = 28,
    max = Math.max(...data.map((x) => x.value), 1);
  const pts = data.map((x, i) => ({
    x: pad + (i * (width - pad * 2)) / Math.max(data.length - 1, 1),
    y: height - pad - (x.value / max) * (height - pad * 2),
    item: x,
  }));
  const path = pts.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
  return (
    <Svg
      accessibilityLabel="Monthly sales line chart"
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {[0, 0.5, 1].map((v) => (
        <Line
          key={v}
          x1={pad}
          x2={width - pad}
          y1={pad + v * (height - pad * 2)}
          y2={pad + v * (height - pad * 2)}
          stroke={palette.border}
          strokeWidth="1"
        />
      ))}
      <Path
        d={path}
        fill="none"
        stroke={palette.primary}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.map((p) => (
        <Circle
          key={p.item.id}
          accessible
          accessibilityLabel={`${p.item.label} ${p.item.value}`}
          onPress={() => onSelect?.(p.item)}
          cx={p.x}
          cy={p.y}
          r="8"
          fill={palette.surface}
          stroke={palette.primary}
          strokeWidth="4"
        />
      ))}
      {pts.map((p) => (
        <SvgText
          key={`${p.item.id}-label`}
          x={p.x}
          y={height - 7}
          fill={palette.muted}
          fontSize="10"
          textAnchor="middle"
        >
          {p.item.label}
        </SvgText>
      ))}
    </Svg>
  );
}

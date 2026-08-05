import Svg, { Line, Rect, Text as SvgText } from "react-native-svg";
import type { ChartDatum } from "@/types/chart";
import type { ChartPalette } from "./palette";
export function BarChart({
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
    max = Math.max(...data.map((x) => Math.abs(x.value)), 1),
    slot = (width - pad * 2) / data.length;
  return (
    <Svg
      accessibilityLabel="Monthly profit bar chart"
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <Line
        x1={pad}
        x2={width - pad}
        y1={height - pad}
        y2={height - pad}
        stroke={palette.border}
      />
      {data.map((item, i) => {
        const h = Math.max(
            3,
            (Math.abs(item.value) / max) * (height - pad * 2),
          ),
          x = pad + i * slot + slot * 0.18,
          y = height - pad - h;
        return (
          <Rect
            key={item.id}
            accessible
            accessibilityLabel={`${item.label} ${item.value}`}
            onPress={() => onSelect?.(item)}
            x={x}
            y={y}
            width={slot * 0.64}
            height={h}
            rx="7"
            fill={item.value < 0 ? palette.danger : palette.positive}
          />
        );
      })}
      {data.map((item, i) => (
        <SvgText
          key={`${item.id}-label`}
          x={pad + i * slot + slot / 2}
          y={height - 7}
          fill={palette.muted}
          fontSize="10"
          textAnchor="middle"
        >
          {item.label}
        </SvgText>
      ))}
    </Svg>
  );
}

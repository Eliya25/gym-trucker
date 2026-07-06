// Shared chart styling for the dark surface (#09090b).
// Series color #059669 validated with the dataviz palette checks (dark mode).
export const chartColors = {
  series: "#059669",
  grid: "#27272a", // zinc-800, recessive
  axis: "#71717a", // zinc-500 labels
  tooltipBg: "#18181b", // zinc-900
  tooltipBorder: "#3f3f46", // zinc-700
};

export const tooltipContentStyle = {
  backgroundColor: chartColors.tooltipBg,
  border: `1px solid ${chartColors.tooltipBorder}`,
  borderRadius: 8,
  color: "#f4f4f5",
  fontSize: 12,
  direction: "rtl" as const,
};

const auditPairs = [
  { name: "royal-blue focus outline on manuscript surface", foreground: "#075A9B", background: "#FFFFFF" },
  { name: "royal-blue focus outline on intake parchment", foreground: "#075A9B", background: "#FFFCF3" },
  { name: "white institutional focus outline on royal navigation", foreground: "#FFFFFF", background: "#06152E" },
  { name: "white institutional focus outline on navy page header", foreground: "#FFFFFF", background: "#143A5E" },
];

function toLinear(channel) {
  const normalized = channel / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const value = hex.slice(1);
  const channels = [0, 2, 4].map(index => Number.parseInt(value.slice(index, index + 2), 16));
  const [red, green, blue] = channels.map(toLinear);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground, background) {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

const results = auditPairs.map(pair => ({ ...pair, ratio: Number(contrastRatio(pair.foreground, pair.background).toFixed(2)) }));
const failures = results.filter(result => result.ratio < 4.5);
console.log(JSON.stringify({ standard: "WCAG AA 4.5:1 minimum", results }, null, 2));
if (failures.length) process.exitCode = 1;

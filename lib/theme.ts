export const colors = {
  ink: "#2b2018",
  sub: "#9a8975",
  coffee: "#6e4b2f",
  caramel: "#c1874e",
  amber: "#d69a45",
  amberEmpty: "#e3d3ba",
  cream: "#efe4d2",
  surface: "#fcf8f1",
  surface2: "#f6efe2",
  field: "#f1e7d7",
  hairline: "rgba(43,32,24,0.09)",
  onCoffee: "#fdf7ee",
  eyebrow: "#a8927a",
  body: "#5c4c3c",
  verb: "#6b5a48",
  tabInactive: "#bda98f",
  searchIcon: "#b0967a",
};

export const radius = { field: 26, card: 18, poster: 12, pill: 22, tile: 8 };
export const space = { screenX: 20, cardGap: 12, sectionGap: 22 };

export const posterPlaceholderTones = [
  "#c1874e",
  "#6e4b2f",
  "#9a8975",
  "#d69a45",
  "#8a6a4e",
  "#b98a5e",
];

export function toneForString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return posterPlaceholderTones[hash % posterPlaceholderTones.length];
}

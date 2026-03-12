/** Predefined user colors for awareness cursors */
const USER_COLORS = [
  "#30bced",
  "#6eeb83",
  "#ffbc42",
  "#ecd444",
  "#ee6352",
  "#9ac2c9",
  "#8acb88",
  "#1be7ff",
  "#e8aa14",
  "#ff5714",
];

/** Generate a random display name */
export function generateUserName(): string {
  const adjectives = [
    "Swift",
    "Bold",
    "Calm",
    "Keen",
    "Warm",
    "Bright",
    "Quick",
    "Sharp",
    "Brave",
    "Noble",
  ];
  const nouns = [
    "Fox",
    "Owl",
    "Bear",
    "Wolf",
    "Hawk",
    "Lynx",
    "Deer",
    "Crow",
    "Hare",
    "Seal",
  ];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}

/** Pick a random user color */
export function pickUserColor(): string {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}

// tokens.js — single source of truth for all design tokens
// Every page, every component imports from here. Never inline a hex code.

export const T = {
  // Dark panels (sidebar, hero, navy sections)
  bg:        "#0E1A2B",
  bgSoft:    "#152540",
  bgSofter:  "#1C3155",

  // Light page surfaces
  page:      "#F5F3ED",
  card:      "#FFFFFF",

  // Text
  ink:       "#12181F",
  sub:       "#5C6672",
  textDark:  "#E8ECF2",
  textMuted: "#8CA0BC",

  // Accent — gold (high priority, approvals, brand)
  gold:       "#C79A3D",
  goldBright: "#E4B84F",
  goldSoft:   "#F1E3C3",

  // Accent — teal (low risk, stable, success)
  teal:     "#2F6E63",
  tealSoft: "#DCEAE6",

  // Accent — rust (high risk, attention, failed)
  rust:     "#B5482F",
  rustSoft: "#F3DDD4",

  // Borders / dividers
  line: "#E4DFD1",
};

export const type = {
  bigNumber: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 700,
    fontSize: 28,
    letterSpacing: "-0.02em",
  },
  cardTitle: {
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontWeight: 600,
    fontSize: 15,
  },
  body: {
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontWeight: 400,
    fontSize: 13,
  },
  label: {
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontWeight: 500,
    fontSize: 12,
    color: "#5C6672",
  },
  microLabel: {
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontWeight: 600,
    fontSize: 10.5,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#5C6672",
  },
  mono: {
    fontFamily: "'IBM Plex Mono', monospace",
  },
};

export const spacing = {
  cardPad:  20,
  cardGap:  20,
  badgePad: "3px 9px",
  radius:   8,
};

// Badge color maps — used by Badges.jsx and any inline pill
export const priorityBadge = {
  High:   { bg: T.goldSoft,  color: T.gold,  border: "#E8C97A" },
  Medium: { bg: "#EEF2FF",   color: "#4338CA", border: "#C7D2FE" },
  Low:    { bg: T.tealSoft,  color: T.teal,  border: "#A8CECA" },
};

export const statusBadge = {
  New:        { bg: "#F0F4FF", color: "#3B5BDB", border: "#BAC8FF" },
  Contacted:  { bg: T.goldSoft, color: "#92400E", border: "#E8C97A" },
  Interested: { bg: T.tealSoft, color: T.teal,   border: "#A8CECA" },
  Applied:    { bg: "#F5F3FF", color: "#6D28D9",  border: "#DDD6FE" },
  Converted:  { bg: "#ECFDF5", color: "#065F46",  border: "#A7F3D0" },
};

export const loanBadge = {
  "Home Loan":     { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  "Personal Loan": { bg: "#F5F3FF", color: "#6D28D9", border: "#DDD6FE" },
  "Auto Loan":     { bg: T.tealSoft, color: T.teal,  border: "#A8CECA" },
  "Mortgage Loan": { bg: T.goldSoft, color: "#92400E", border: "#E8C97A" },
};

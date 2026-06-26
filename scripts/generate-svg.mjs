// Generates animated SVG assets for the profile README.
// Runs inside GitHub Actions (Node 20+). Uses built-in fetch.
// Output: assets/hero.svg, assets/stats.svg, assets/gateway.svg

import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "assets");

const USER = process.env.GH_USER || "zddgg";
const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || "";

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "zddgg-profile-renderer",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

async function fetchJSON(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    console.warn(`warn: ${url} -> ${res.status}`);
    return null;
  }
  return res.json();
}

async function loadStats() {
  const user = await fetchJSON(`https://api.github.com/users/${USER}`);
  // Sum stars across repos (up to 100 most recently pushed)
  const repos = await fetchJSON(
    `https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`
  );
  const stars = Array.isArray(repos)
    ? repos.reduce((s, r) => s + (r.stargazers_count || 0), 0)
    : 0;
  return {
    name: user?.name || USER,
    bio: user?.bio || "Full Stack Developer",
    publicRepos: user?.public_repos ?? 0,
    followers: user?.followers ?? 0,
    following: user?.following ?? 0,
    stars,
    createdAt: user?.created_at || "2018-05-01",
  };
}

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;",
}[c]));

// ───────────────────────── HERO BANNER ─────────────────────────
function heroSVG(stats) {
  const now = new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 320" width="920" height="320" font-family="'Segoe UI',Helvetica,Arial,sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a0e1a"/>
      <stop offset="0.5" stop-color="#0d1117"/>
      <stop offset="1" stop-color="#11172a"/>
    </linearGradient>
    <radialGradient id="meshA" cx="0.2" cy="0.3" r="0.5">
      <stop offset="0" stop-color="#7c3aed" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#7c3aed" stop-opacity="0"/>
      <animate attributeName="cx" values="0.2;0.8;0.2" dur="14s" repeatCount="indefinite"/>
      <animate attributeName="cy" values="0.3;0.7;0.3" dur="17s" repeatCount="indefinite"/>
    </radialGradient>
    <radialGradient id="meshB" cx="0.8" cy="0.7" r="0.5">
      <stop offset="0" stop-color="#06b6d4" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#06b6d4" stop-opacity="0"/>
      <animate attributeName="cx" values="0.8;0.15;0.8" dur="19s" repeatCount="indefinite"/>
      <animate attributeName="cy" values="0.7;0.25;0.7" dur="13s" repeatCount="indefinite"/>
    </radialGradient>
    <radialGradient id="meshC" cx="0.5" cy="0.5" r="0.4">
      <stop offset="0" stop-color="#ec4899" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#ec4899" stop-opacity="0"/>
      <animate attributeName="cx" values="0.5;0.2;0.85;0.5" dur="22s" repeatCount="indefinite"/>
    </radialGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="#1f2937" stroke-width="0.5" opacity="0.5"/>
    </pattern>
    <linearGradient id="txt" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#a78bfa"/>
      <stop offset="0.5" stop-color="#22d3ee"/>
      <stop offset="1" stop-color="#f472b6"/>
      <animate attributeName="x1" values="0;1;0" dur="8s" repeatCount="indefinite"/>
      <animate attributeName="x2" values="1;2;1" dur="8s" repeatCount="indefinite"/>
    </linearGradient>
  </defs>

  <rect width="920" height="320" fill="url(#bg)"/>
  <rect width="920" height="320" fill="url(#meshA)"/>
  <rect width="920" height="320" fill="url(#meshB)"/>
  <rect width="920" height="320" fill="url(#meshC)"/>
  <rect width="920" height="320" fill="url(#grid)"/>

  <!-- HUD corner ticks -->
  <g stroke="#22d3ee" stroke-width="1.5" fill="none" opacity="0.8">
    <path d="M20 20 H60 M20 20 V60"/>
    <path d="M900 20 H860 M900 20 V60"/>
    <path d="M20 300 H60 M20 300 V260"/>
    <path d="M900 300 H860 M900 300 V260"/>
  </g>

  <!-- scanline -->
  <rect x="0" y="0" width="920" height="2" fill="#22d3ee" opacity="0.25">
    <animate attributeName="y" values="0;320;0" dur="6s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.05;0.35;0.05" dur="6s" repeatCount="indefinite"/>
  </rect>

  <!-- name -->
  <text x="60" y="170" font-size="96" font-weight="800" fill="url(#txt)" filter="url(#glow)" letter-spacing="2">${esc(stats.name)}</text>

  <!-- subtitle -->
  <text x="62" y="210" font-size="20" fill="#94a3b8" letter-spacing="3">FULL-STACK ENGINEER  ·  API GATEWAY ARCHITECT</text>

  <!-- online indicator -->
  <g transform="translate(62,245)">
    <circle cx="0" cy="0" r="5" fill="#22c55e">
      <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite"/>
    </circle>
    <text x="14" y="5" font-size="14" fill="#64748b" font-family="'JetBrains Mono',monospace">available for collab</text>
  </g>

  <!-- live timestamp -->
  <text x="860" y="285" font-size="12" fill="#475569" text-anchor="end" font-family="'JetBrains Mono',monospace">${esc(now)}</text>
</svg>`;
}

// ───────────────────────── STATS TERMINAL ─────────────────────────
function statsSVG(s) {
  const years = Math.max(
    1,
    new Date().getFullYear() - new Date(s.createdAt).getFullYear()
  );
  const line = (k, v) =>
    `  <text x="24" y="${y}" fill="#64748b" font-size="14" font-family="'JetBrains Mono',monospace">${k}</text>` +
    `<text x="170" y="${y}" fill="#e2e8f0" font-size="14" font-family="'JetBrains Mono',monospace">${v}</text>`;
  let y = 150;
  const rows = [
    ["repos", String(s.publicRepos)],
    ["stars", String(s.stars)],
    ["followers", String(s.followers)],
    ["years_active", `${years}y`],
  ];
  const rowsXml = rows
    .map(([k, v]) => {
      const r = `  <text x="24" y="${y}" fill="#64748b" font-size="14" font-family="'JetBrains Mono',monospace">${k}</text><text x="180" y="${y}" fill="#e2e8f0" font-size="14" font-family="'JetBrains Mono',monospace">${v}</text>`;
      y += 26;
      return r;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 320" width="640" height="320" font-family="'Segoe UI',Helvetica,Arial,sans-serif">
  <defs>
    <linearGradient id="sbg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0d1117"/>
      <stop offset="1" stop-color="#010409"/>
    </linearGradient>
    <filter id="sglow"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>

  <rect width="640" height="320" rx="12" fill="url(#sbg)" stroke="#1f2937"/>

  <!-- title bar -->
  <rect width="640" height="36" rx="12" fill="#161b22"/>
  <rect y="24" width="640" height="12" fill="#161b22"/>
  <circle cx="22" cy="18" r="6" fill="#ff5f56"/>
  <circle cx="42" cy="18" r="6" fill="#ffbd2e"/>
  <circle cx="62" cy="18" r="6" fill="#27c93f"/>
  <text x="320" y="23" font-size="13" fill="#64748b" text-anchor="middle" font-family="'JetBrains Mono',monospace">zddgg@github — bash</text>

  <!-- prompt lines -->
  <text x="24" y="78" fill="#22d3ee" font-size="14" font-family="'JetBrains Mono',monospace">$ whoami</text>
  <text x="24" y="100" fill="#a78bfa" font-size="14" font-family="'JetBrains Mono',monospace">→ ${esc(s.name)} · ${esc(s.bio)}</text>

  <text x="24" y="132" fill="#22d3ee" font-size="14" font-family="'JetBrains Mono',monospace">$ stats --live</text>

${rowsXml}

  <!-- blinking cursor -->
  <text x="24" y="${y + 8}" fill="#22d3ee" font-size="14" font-family="'JetBrains Mono',monospace">$</text>
  <rect x="40" y="${y - 4}" width="9" height="16" fill="#22d3ee">
    <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite"/>
  </rect>
</svg>`;
}

// ───────────────────────── GATEWAY VIZ ─────────────────────────
function gatewaySVG() {
  // client -> gateway -> 4 services
  const services = ["auth", "user", "order", "pay"];
  const svcX = 760;
  const svcStartY = 60;
  const svcGap = 60;
  const gatewayX = 420;
  const gatewayY = 160;
  const clientX = 80;
  const clientY = 160;

  const svcNodes = services
    .map((name, i) => {
      const y = svcStartY + i * svcGap;
      return `
    <line x1="${gatewayX + 60}" y1="${gatewayY}" x2="${svcX - 40}" y2="${y}" stroke="#334155" stroke-width="1.5" stroke-dasharray="6 6">
      <animate attributeName="stroke-dashoffset" values="0;-24" dur="${0.8 + i * 0.2}s" repeatCount="indefinite"/>
    </line>
    <g transform="translate(${svcX},${y})">
      <circle r="6" fill="#22d3ee">
        <animate attributeName="r" values="6;9;6" dur="${1.5 + i * 0.3}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;0.5;1" dur="${1.5 + i * 0.3}s" repeatCount="indefinite"/>
      </circle>
      <rect x="10" y="-14" width="90" height="28" rx="6" fill="#0d1117" stroke="#1f6feb"/>
      <text x="55" y="4" font-size="12" fill="#93c5fd" text-anchor="middle" font-family="'JetBrains Mono',monospace">${name}.svc</text>
    </g>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 280" width="920" height="280" font-family="'Segoe UI',Helvetica,Arial,sans-serif">
  <defs>
    <linearGradient id="gbg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#0d1117"/>
      <stop offset="1" stop-color="#0a0e1a"/>
    </linearGradient>
    <filter id="gglow"><feGaussianBlur stdDeviation="4"/></filter>
  </defs>

  <rect width="920" height="280" fill="url(#gbg)"/>
  <text x="20" y="30" font-size="12" fill="#475569" font-family="'JetBrains Mono',monospace">// request flow</text>

  <!-- client -> gateway (flowing) -->
  <line x1="${clientX + 40}" y1="${clientY}" x2="${gatewayX - 50}" y2="${gatewayY}" stroke="#1f6feb" stroke-width="2" stroke-dasharray="8 6">
    <animate attributeName="stroke-dashoffset" values="0;-28" dur="1s" repeatCount="indefinite"/>
  </line>

  <!-- client node -->
  <g transform="translate(${clientX},${clientY})">
    <circle r="40" fill="#0d1117" stroke="#a78bfa" stroke-width="2"/>
    <circle r="40" fill="none" stroke="#a78bfa" stroke-width="2" opacity="0.5">
      <animate attributeName="r" values="40;52;40" dur="2.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.5;0;0.5" dur="2.5s" repeatCount="indefinite"/>
    </circle>
    <text y="5" font-size="12" fill="#c4b5fd" text-anchor="middle" font-family="'JetBrains Mono',monospace">CLIENT</text>
  </g>

  <!-- gateway node -->
  <g transform="translate(${gatewayX},${gatewayY})">
    <rect x="-50" y="-34" width="100" height="68" rx="10" fill="#0d1117" stroke="#22d3ee" stroke-width="2" filter="url(#gglow)" opacity="0.9"/>
    <rect x="-50" y="-34" width="100" height="68" rx="10" fill="none" stroke="#22d3ee" stroke-width="2"/>
    <text y="-4" font-size="13" fill="#67e8f9" text-anchor="middle" font-family="'JetBrains Mono',monospace">API</text>
    <text y="14" font-size="13" fill="#67e8f9" text-anchor="middle" font-family="'JetBrains Mono',monospace">GATEWAY</text>
    <circle cx="0" cy="0" r="3" fill="#22c55e">
      <animate attributeName="opacity" values="1;0.2;1" dur="0.7s" repeatCount="indefinite"/>
    </circle>
  </g>

${svcNodes}

  <text x="900" y="265" font-size="10" fill="#334155" text-anchor="end" font-family="'JetBrains Mono',monospace">edge · resilient · observable</text>
</svg>`;
}

// ───────────────────────── MAIN ─────────────────────────
async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const stats = await loadStats();
  console.log("stats:", stats);

  const files = {
    "hero.svg": heroSVG(stats),
    "stats.svg": statsSVG(stats),
    "gateway.svg": gatewaySVG(),
  };
  for (const [name, content] of Object.entries(files)) {
    await writeFile(join(OUT_DIR, name), content, "utf8");
    console.log("wrote", name);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

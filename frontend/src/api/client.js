import fallback from "../data/fallback.json";

/** Strip trailing slashes so `https://api.example.com/` + `/api/x` never becomes `//api/x`. */
const API = String(import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");

export function apiUrl(path) {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${API}${suffix}`;
}

async function request(path, options = {}, timeout = 20000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(apiUrl(path), { ...options, signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function getJSON(path) {
  const res = await request(path);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function loadPortfolio() {
  try {
    const [profile, skills, projects, experience] = await Promise.all([
      getJSON("/api/profile"),
      getJSON("/api/skills"),
      getJSON("/api/projects"),
      getJSON("/api/experience"),
    ]);
    return { profile, skills, projects, experience, source: "api" };
  } catch {
    return { ...fallback, source: "fallback" };
  }
}

function errorMessage(data, fallbackText) {
  if (!data) return fallbackText;
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail.map((item) => item.msg || "Invalid field").join(" ");
  }
  return fallbackText;
}

export async function sendContact(body) {
  const res = await request("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status === 429) {
    const err = new Error("Too many messages. Try again in a few minutes.");
    err.status = 429;
    throw err;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(errorMessage(data, "Could not send the message."));
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function sendChat(body) {
  let res;
  try {
    res = await request(
      "/api/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      60000,
    );
  } catch (err) {
    if (err?.name === "AbortError") {
      const timeout = new Error("Ali is still thinking — try again in a sec!");
      timeout.status = 408;
      throw timeout;
    }
    const network = new Error("Can't reach Ali's brain. Is the backend running?");
    network.status = 0;
    throw network;
  }
  if (res.status === 429) {
    const err = new Error("Too many questions! Give me a sec.");
    err.status = 429;
    throw err;
  }
  if (!res.ok) {
    const err = new Error("My brain is rebooting... try again!");
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function downloadResume() {
  const res = await request("/api/resume");
  if (res.status === 404) {
    const err = new Error("Resume not uploaded yet.");
    err.status = 404;
    throw err;
  }
  if (!res.ok) throw new Error("Could not download the resume.");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Pratham_Resume.pdf";
  link.click();
  URL.revokeObjectURL(url);
}

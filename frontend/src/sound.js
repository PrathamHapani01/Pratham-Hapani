let enabled = false;
let ctx;

export function setSoundEnabled(value) {
  enabled = value;
  try {
    localStorage.setItem("sound", value ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function blip(kind) {
  if (!enabled) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  if (!ctx) ctx = new AudioCtx();
  if (ctx.state === "suspended") ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = kind === "pop" ? 680 : kind === "hover" ? 420 : 520;
  gain.gain.value = 0.035;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.045);
}

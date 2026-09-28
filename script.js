// ============================================================
// Nadia Proposal — vanilla JS
// ============================================================

const CONFIG = {
  packageFallMs: 2000,
  sceneTransitionMs: 950,
  candleLightRadius: 185,
  candleMessageRadius: 235,
};

const packageButton = document.getElementById("package");
const nadiaTitle = document.getElementById("nadia-title");
const packageFlash = document.getElementById("package-flash");
const sceneTwo = document.getElementById("scene-two");
const darkness = document.getElementById("darkness");
const spotlight = document.getElementById("spotlight");
const candle = document.getElementById("candle");
const candleStage = document.getElementById("candle-stage");
const proposalMessage = document.getElementById("proposal-message");

let packageOpened = false;
let candleHeld = false;
let candleOffset = { x: 0, y: 0 };
let proposalFound = false;

// ------------------------------------------------------------
// Scene 1 — reveal title after the package lands
// ------------------------------------------------------------
window.setTimeout(() => {
  nadiaTitle.classList.add("show");
}, CONFIG.packageFallMs + 400);

packageButton.addEventListener("click", openPackage);

function openPackage() {
  if (packageOpened) return;
  packageOpened = true;

  packageButton.classList.add("shaking");

  window.setTimeout(() => {
    packageButton.classList.remove("shaking");
    packageButton.classList.add("opening");
  }, 650);

  window.setTimeout(() => {
    packageFlash.classList.add("go");
    sceneTwo.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 1750);

  window.setTimeout(() => {
    packageFlash.classList.remove("go");
  }, 2450);
}

// ------------------------------------------------------------
// Candle — hold and drag
// ------------------------------------------------------------
function pointerPosition(event) {
  return { x: event.clientX, y: event.clientY };
}

function setSpotlight(x, y) {
  document.documentElement.style.setProperty("--spot-x", `${x}px`);
  document.documentElement.style.setProperty("--spot-y", `${y}px`);
}

function setCandlePosition(clientX, clientY) {
  const rect = candleStage.getBoundingClientRect();
  const x = Math.max(35, Math.min(rect.width - 35, clientX - rect.left - candleOffset.x));
  const y = Math.max(45, Math.min(rect.height - 40, clientY - rect.top - candleOffset.y));

  candle.style.left = `${x}px`;
  candle.style.top = `${y}px`;
  candle.style.transform = "translate(-50%, -50%)";
}

function startCandle(event) {
  event.preventDefault();
  candleHeld = true;
  candle.setPointerCapture?.(event.pointerId);

  const rect = candle.getBoundingClientRect();
  candleOffset.x = event.clientX - (rect.left + rect.width / 2);
  candleOffset.y = event.clientY - (rect.top + rect.height / 2);

  darkness.classList.add("active");
  document.body.classList.add("candle-active");
  moveCandle(event);
}

function moveCandle(event) {
  if (!candleHeld) return;
  event.preventDefault();
  setCandlePosition(event.clientX, event.clientY);
  setSpotlight(event.clientX, event.clientY);
  checkProposal(event.clientX, event.clientY);
}

function stopCandle(event) {
  if (!candleHeld) return;
  candleHeld = false;
  try { candle.releasePointerCapture?.(event.pointerId); } catch (_) {}
  document.body.classList.remove("candle-active");
  darkness.classList.remove("active");
}

candle.addEventListener("pointerdown", startCandle);
candle.addEventListener("pointermove", moveCandle);
candle.addEventListener("pointerup", stopCandle);
candle.addEventListener("pointercancel", stopCandle);

// Keep the flashlight under the pointer even if the user starts over the candle.
window.addEventListener("pointermove", (event) => {
  if (candleHeld) setSpotlight(event.clientX, event.clientY);
});

// Keyboard fallback for accessibility.
candle.addEventListener("keydown", (event) => {
  const step = 25;
  const current = candle.getBoundingClientRect();
  if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
  event.preventDefault();

  let x = current.left + current.width / 2;
  let y = current.top + current.height / 2;
  if (event.key === "ArrowUp") y -= step;
  if (event.key === "ArrowDown") y += step;
  if (event.key === "ArrowLeft") x -= step;
  if (event.key === "ArrowRight") x += step;

  darkness.classList.add("active");
  setSpotlight(x, y);
  checkProposal(x, y);
});

candle.addEventListener("blur", () => {
  darkness.classList.remove("active");
});

// ------------------------------------------------------------
// Hidden proposal discovery
// ------------------------------------------------------------
// The message is placed at a fixed viewport location for this prototype.
// Move it by editing the CSS .proposal-message position.
function checkProposal(x, y) {
  if (proposalFound) return;

  const rect = proposalMessage.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const distance = Math.hypot(x - centerX, y - centerY);

  if (distance < CONFIG.candleMessageRadius) {
    proposalFound = true;
    proposalMessage.classList.add("found");
    proposalMessage.animate(
      [
        { opacity: 0, transform: "translate(-50%, -50%) scale(.75) rotate(-1deg)" },
        { opacity: 1, transform: "translate(-50%, -50%) scale(1.08) rotate(1deg)" },
        { opacity: 1, transform: "translate(-50%, -50%) scale(1) rotate(-1deg)" },
      ],
      { duration: 1100, easing: "cubic-bezier(.2,.9,.2,1)", fill: "forwards" }
    );
  }
}

// The hidden message itself is always underneath the flashlight.
// It becomes visually readable because the spotlight reveals it.
proposalMessage.style.opacity = "1";

// ------------------------------------------------------------
// Optional PNG asset helper
// ------------------------------------------------------------
// If you later replace the fallback Nadia letters with PNGs,
// use this pattern in HTML:
// <img src="assets/nadia-n.png" alt="N" class="letter-image">

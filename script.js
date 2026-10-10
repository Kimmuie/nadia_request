// ============================================================
// Nadia Proposal — vanilla JS
// ============================================================

const CONFIG = {
  packageFallMs: 2000,
  sceneTransitionMs: 950,
  candleMessageRadius: 235,
};

const packageButton = document.getElementById("package");
const nadiaTitle = document.getElementById("nadia-title");
const packageFlash = document.getElementById("package-flash");
const sceneTwo = document.getElementById("scene-two");
const darkness = document.getElementById("darkness");
const holdThisImage = document.getElementById("hold-this-image");
const candle = document.getElementById("candle");
const candleSection = document.getElementById("candle-section");
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
  packageButton.classList.add("can-open");
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
// Candle — sits at the center of the screen, hold and drag
// ------------------------------------------------------------
// The candle is position: fixed (see CSS), so it starts at the center of the
// viewport regardless of how tall the scene is. Once dragged, left/top are
// viewport pixels and the element keeps translate(-50%, -50%).

// Only show the candle while the candle section is on screen,
// otherwise it would float over scene one and the story.
new IntersectionObserver(
  ([entry]) => {
    candle.classList.toggle("visible", entry.intersectionRatio >= 0.99);
  },
  { threshold: [0, 0.8, 1] }
).observe(candleSection);

function setSpotlight(x, y) {
  document.documentElement.style.setProperty("--spot-x", `${x}px`);
  document.documentElement.style.setProperty("--spot-y", `${y - 75}px`);
}

function setCandlePosition(x, y) {
  const cx = Math.max(0, Math.min(window.innerWidth, x));
  const cy = Math.max(0, Math.min(window.innerHeight, y));

  candle.style.left = `${cx}px`;
  candle.style.top = `${cy}px`;

  // The lit circle follows the candle.
  setSpotlight(cx, cy);
  checkProposal(cx, cy);
}

function startCandle(event) {
  event.preventDefault();
  candleHeld = true;
  candle.setPointerCapture?.(event.pointerId);

  // Remember where inside the candle it was grabbed, so it doesn't jump.
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
  setCandlePosition(event.clientX - candleOffset.x, event.clientY - candleOffset.y);
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

// Keyboard fallback for accessibility.
candle.addEventListener("keydown", (event) => {
  const step = 25;
  if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
  event.preventDefault();

  const current = candle.getBoundingClientRect();
  let x = current.left + current.width / 2;
  let y = current.top + current.height / 2;
  if (event.key === "ArrowUp") y -= step;
  if (event.key === "ArrowDown") y += step;
  if (event.key === "ArrowLeft") x -= step;
  if (event.key === "ArrowRight") x += step;

  darkness.classList.add("active");
  setCandlePosition(x, y);
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
// It becomes readable only inside the lit circle.
proposalMessage.style.opacity = "1";
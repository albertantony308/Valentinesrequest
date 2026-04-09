const proposalCard = document.getElementById("proposal-card");
const celebrationCard = document.getElementById("celebration-card");
const buttonStage = document.getElementById("button-stage");
const yesButton = document.getElementById("yes-button");
const noButton = document.getElementById("no-button");
const restartButton = document.getElementById("restart-button");

const noMessages = [
  "No",
  "Maybe not this one",
  "That tiny button is feeling shy",
  "Aww, it floated away again",
  "It thinks yes is the cuter answer",
  "Still drifting... maybe follow your heart",
  "This button clearly wants to play hide and seek",
  "It keeps dodging because the sweet answer is nearby",
  "This little button has become professionally slippery",
  "It flew off to leave the spotlight to yes",
  "No is still running laps around your cursor",
  "The page is giggling and moving it again",
];

let dodgeCount = 0;
let stageBounds = null;
let pointerX = -9999;
let pointerY = -9999;
let dodgeLocked = false;
let lastLanding = { x: null, y: null };

function updateStageBounds() {
  stageBounds = buttonStage.getBoundingClientRect();
}

function pickFarLanding(stageWidth, stageHeight, yesLeft, yesTop, yesRight, yesBottom) {
  const spots = [
    { x: -70, y: -30 },
    { x: stageWidth - noButton.offsetWidth + 50, y: -30 },
    { x: stageWidth * 0.34, y: stageHeight * 0.22 },
    { x: stageWidth * 0.1, y: stageHeight * 0.52 },
    { x: stageWidth * 0.52, y: stageHeight * 0.54 },
  ].map((spot) => ({
    x: Math.round(spot.x),
    y: Math.round(spot.y),
  }));

  const rankedSpots = spots
    .map((spot) => {
      const right = spot.x + noButton.offsetWidth;
      const bottom = spot.y + noButton.offsetHeight;
      const horizontalGap = Math.max(0, Math.max(yesLeft - right, spot.x - yesRight));
      const verticalGap = Math.max(0, Math.max(yesTop - bottom, spot.y - yesBottom));
      const centerX = spot.x + noButton.offsetWidth / 2;
      const centerY = spot.y + noButton.offsetHeight / 2;
      const pointerDistance = Math.hypot(centerX - pointerX, centerY - pointerY);
      const lastDistance =
        lastLanding.x === null || lastLanding.y === null
          ? 9999
          : Math.hypot(spot.x - lastLanding.x, spot.y - lastLanding.y);

      return {
        ...spot,
        score: pointerDistance + lastDistance + horizontalGap + verticalGap,
        pointerDistance,
        lastDistance,
        safeFromYes: horizontalGap >= 150 || verticalGap >= 120,
      };
    })
    .filter((spot) => spot.safeFromYes && spot.pointerDistance >= 260 && spot.lastDistance >= 120)
    .sort((a, b) => b.score - a.score);

  if (rankedSpots.length > 0) {
    return rankedSpots[0];
  }

  return spots[0];
}

function moveNoButton(event) {
  if (dodgeLocked) {
    return;
  }

  dodgeLocked = true;
  updateStageBounds();

  if (event?.touches?.[0]) {
    pointerX = event.touches[0].clientX - stageBounds.left;
    pointerY = event.touches[0].clientY - stageBounds.top;
  } else if (typeof event?.clientX === "number" && typeof event?.clientY === "number") {
    pointerX = event.clientX - stageBounds.left;
    pointerY = event.clientY - stageBounds.top;
  }

  const yesLeft = yesButton.offsetLeft;
  const yesTop = yesButton.offsetTop;
  const yesRight = yesLeft + yesButton.offsetWidth;
  const yesBottom = yesTop + yesButton.offsetHeight;
  const stageWidth = stageBounds.width;
  const stageHeight = stageBounds.height;
  const nextLanding = pickFarLanding(stageWidth, stageHeight, yesLeft, yesTop, yesRight, yesBottom);
  const nextX = nextLanding.x;
  const nextY = nextLanding.y;

  noButton.style.left = `${nextX}px`;
  noButton.style.top = `${nextY}px`;
  noButton.style.right = "auto";
  lastLanding = { x: nextX, y: nextY };

  dodgeCount += 1;
  noButton.textContent = noMessages[dodgeCount % noMessages.length];

  window.setTimeout(() => {
    dodgeLocked = false;
  }, 220);
}

function triggerCelebration() {
  proposalCard.classList.add("hidden");
  celebrationCard.classList.remove("hidden");
}

function resetProposal() {
  celebrationCard.classList.add("hidden");
  proposalCard.classList.remove("hidden");
  dodgeCount = 0;
  noButton.textContent = noMessages[0];
  noButton.style.left = "";
  noButton.style.top = "";
  noButton.style.right = "";
  lastLanding = { x: null, y: null };
}

["mouseenter", "pointerenter", "touchstart"].forEach((eventName) => {
  noButton.addEventListener(eventName, moveNoButton);
});

yesButton.addEventListener("click", triggerCelebration);
restartButton.addEventListener("click", resetProposal);
window.addEventListener("resize", updateStageBounds);

updateStageBounds();

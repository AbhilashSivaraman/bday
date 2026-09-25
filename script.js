/* =========================================================
   CONFIG
========================================================= */
const TOTAL_PHOTOS = 2;
const PETAL_COUNT = 18;
const PETAL_CHARS = ['✿', '❀', '🌸', '💮'];

/* =========================================================
   AMBIENT FALLING PETALS
========================================================= */
function initPetals(){
  const field = document.getElementById('petalField');
  if(!field) return;

  for(let i = 0; i < PETAL_COUNT; i++){
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.textContent = PETAL_CHARS[Math.floor(Math.random() * PETAL_CHARS.length)];

    const left = Math.random() * 100;
    const duration = 10 + Math.random() * 12;
    const delay = Math.random() * 14;
    const size = 0.9 + Math.random() * 1.1;

    petal.style.left = `${left}vw`;
    petal.style.animationDuration = `${duration}s`;
    petal.style.animationDelay = `${delay}s`;
    petal.style.fontSize = `${size}rem`;

    field.appendChild(petal);
  }
}

/* =========================================================
   CONFETTI BURST (canvas, no external libraries)
========================================================= */
function burstConfetti(){
  const canvas = document.getElementById('confettiCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#ff8fab', '#e85d8a', '#ffd6e3', '#f0c36d', '#ffffff', '#b23a5c'];
  const pieces = [];
  const originX = canvas.width / 2;
  const originY = canvas.height * 0.35;

  for(let i = 0; i < 140; i++){
    pieces.push({
      x: originX,
      y: originY,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 1.4) * 14,
      size: 5 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 12,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
      gravity: 0.28 + Math.random() * 0.15,
      drag: 0.985
    });
  }

  let frame = 0;
  const maxFrames = 130;

  function animate(){
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach(p => {
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - frame / maxFrames);

      if(p.shape === 'rect'){
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    if(frame < maxFrames){
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
  const canvas = document.getElementById('confettiCanvas');
  if(canvas){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
});

/* =========================================================
   GREETING CARD FLIP
========================================================= */
function initGreetingCard(){
  const card = document.getElementById('greetingCard');
  if(!card) return;

  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', 'Open birthday card');

  let opened = false;

  function toggle(){
    opened = !opened;
    card.classList.toggle('open', opened);
    card.setAttribute('aria-label', opened ? 'Close birthday card' : 'Open birthday card');
    if(opened){
      burstConfetti();
    }
  }

  card.addEventListener('click', toggle);
  card.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      toggle();
    }
  });
}

/* =========================================================
   PHOTO GALLERY — build 24 flip cards
========================================================= */
function buildGallery(){
  const grid = document.getElementById('polaroidGrid');
  if(!grid) return;

  for(let i = 1; i <= TOTAL_PHOTOS; i++){
    const cell = document.createElement('div');
    cell.className = 'poloroid-cell';

    // randomized "thrown down" scatter — different every load, criss-crossed
    const rot = (Math.random() * 14 - 7).toFixed(2);          // -7deg .. 7deg
    const dx  = Math.round(Math.random() * 24 - 12);          // -12px .. 12px
    const dy  = Math.round(Math.random() * 20 - 10);          // -10px .. 10px
    cell.style.setProperty('--rot', `${rot}deg`);
    cell.style.setProperty('--dx', `${dx}px`);
    cell.style.setProperty('--dy', `${dy}px`);

    cell.innerHTML = `
      <div class="flip-card" tabindex="0" role="button" aria-label="Reveal memory ${i}">
        <div class="flip-card-inner">

          <div class="flip-face flip-front">
            <span class="mini-heart">♡</span>
            <span class="num">${i}</span>
            <span class="hint">tap to reveal</span>
            <span class="mini-heart">♡</span>
          </div>

          <div class="flip-face flip-back">
            <div class="tape"></div>
            <div class="photo-frame">
              <img
                src="assets/image${i}.jpg"
                alt="Memory ${i} with Paapa"
                loading="lazy"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
              >
              <div class="missing" style="display:none;">add assets/image${i}.jpg</div>
            </div>
            <p class="caption">memory ${String(i).padStart(2, '0')}</p>
          </div>

        </div>
      </div>
    `;

    grid.appendChild(cell);

    const flipCard = cell.querySelector('.flip-card');
    let revealed = false;

    function toggle(){
      revealed = !revealed;
      flipCard.classList.toggle('revealed', revealed);
    }

    flipCard.addEventListener('click', toggle);
    flipCard.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        toggle();
      }
    });
  }
}

/* =========================================================
   INIT
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  initPetals();
  initGreetingCard();
  buildGallery();
});

// ============================================
//  AUDIO
// ============================================

const audioJohn = new Audio('John.mp3');
audioJohn.loop = true;

const audioWord = new Audio('word.mp3');
audioWord.loop = true;

// Iniciar John.mp3 al primer clic del usuario
document.addEventListener('click', function startJohn() {
  audioJohn.play().catch(() => {});
  document.removeEventListener('click', startJohn);
}, { once: true });

// ============================================
//  AUDIO: Web Audio API — solo cronómetro
// ============================================
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx = null;

function getCtx() {
  if (!ctx) ctx = new AudioCtx();
  return ctx;
}

// Clic retro Mac
function playClick() {
  const c = getCtx();
  const buf = c.createBuffer(1, c.sampleRate * 0.04, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 8);
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.35, c.currentTime);
  src.connect(gain);
  gain.connect(c.destination);
  src.start();
}

// Tick normal del cronómetro
function playTick() {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(880, c.currentTime);
  gain.gain.setValueAtTime(0.15, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.08);
}

// Tick urgente — últimos 3 segundos
function playTickUrgent() {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(1320, c.currentTime);
  gain.gain.setValueAtTime(0.25, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.12);
}

// ============================================
//  STOPWATCH
// ============================================
let countdown = 10;
let timer = null;
let running = false;

function showStopwatch() {
  playClick();
  document.getElementById('screen-execute').style.display = 'none';
  document.getElementById('screen-stopwatch').style.display = 'flex';
  updateDisplay(10);
}

function updateDisplay(secs) {
  const s = String(Math.floor(secs)).padStart(2, '0');
  document.getElementById('sw-display').textContent = `00:00:${s}.0`;
}

function startCountdown() {
  if (running) return;
  playClick();
  running = true;
  countdown = 10;
  document.getElementById('go-btn').disabled = true;

  timer = setInterval(() => {
    countdown--;
    updateDisplay(countdown);

    if (countdown <= 3 && countdown > 0) {
      playTickUrgent();
    } else if (countdown > 0) {
      playTick();
    }

    if (countdown <= 0) {
      clearInterval(timer);
      running = false;
      showFailed();
    }
  }, 1000);
}

function stopCountdown() {
  playClick();
  clearInterval(timer);
  running = false;
  document.getElementById('go-btn').disabled = false;
}

function resetStopwatch() {
  playClick();
  clearInterval(timer);
  running = false;
  countdown = 10;
  updateDisplay(10);
  document.getElementById('go-btn').disabled = false;
}

// ============================================
//  PANTALLA 2 → 3: FALLOS
// ============================================
function showFailed() {
  document.getElementById('screen-stopwatch').style.display = 'none';
  document.getElementById('screen-failed').style.display = 'flex';

  // Iniciar word.mp3 solo en pantalla del mapa
  audioWord.currentTime = 0;
  audioWord.play().catch(() => {});
}

// ============================================
//  PANTALLA 3 → 4: TERMINAL
// ============================================
let accessAttempts = 0;

function showTerminal() {
  playClick();

  // Detener word.mp3 al salir del mapa
  audioWord.pause();
  audioWord.currentTime = 0;

  // Limpiar log anterior
  document.getElementById('terminal-log').innerHTML = '';
  accessAttempts = 0;

  document.getElementById('screen-failed').style.display = 'none';
  document.getElementById('screen-terminal').style.display = 'flex';
  document.getElementById('terminal-input').value = '';
  document.getElementById('terminal-input').placeholder = 'escribe el codigo de acceso...';
  document.getElementById('terminal-input').focus();
}

// ============================================
//  PANTALLA 4: VERIFICAR CODIGO — 3 INTENTOS
// ============================================
function checkCode(e) {
  if (e.key === 'Enter') {
    const val = document.getElementById('terminal-input').value.trim().toLowerCase();
    const log = document.getElementById('terminal-log');
    const input = document.getElementById('terminal-input');

    if (val === '') return;

    // Mostrar línea del comando escrito
    const cmdLine = document.createElement('div');
    cmdLine.textContent = '> ' + val;
    log.appendChild(cmdLine);

    input.value = '';

    if (val === 'access') {
      accessAttempts++;

      // Siempre muestra PERMISSION DENIED
      const denied = document.createElement('div');
      denied.textContent = 'access: PERMISSION DENIED.';
      denied.style.color = '#ff4422';
      log.appendChild(denied);
      log.scrollTop = log.scrollHeight;

      if (accessAttempts >= 3) {
        // Al tercer intento — aparece Nedry
        input.disabled = true;
        setTimeout(() => {
          showNedry();
        }, 600);
      }

    } else {
      // Comando desconocido
      const err = document.createElement('div');
      err.textContent = val + ': command not found';
      err.style.color = '#ff4422';
      log.appendChild(err);
      log.scrollTop = log.scrollHeight;
    }
  }
}

// ============================================
//  PANTALLA 4 → 5: NEDRY
// ============================================
function showNedry() {
  document.getElementById('screen-terminal').style.display = 'none';
  document.getElementById('screen-nedry').style.display = 'block';

  // Detener John.mp3
  audioJohn.pause();

  // Reproducir magic_word.mp3 en loop
  const audio = document.getElementById('audio-magic');
  audio.play().catch(() => {});
  audio.addEventListener('ended', () => {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  });

  // Llenar fondo con el texto
  const flood = document.getElementById('magic-flood');
  const msg = "YOU DIDN'T SAY THE MAGIC WORD!   ";
  let html = '';
  for (let i = 0; i < 400; i++) {
    html += msg + (i % 5 === 4 ? '<br>' : '');
  }
  flood.innerHTML = html;
}
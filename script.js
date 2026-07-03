document.addEventListener("DOMContentLoaded", () => {
  const numbersContainer = document.getElementById("numbers");
  const ticksContainer = document.getElementById("ticks");
  const hourHand = document.getElementById("hourHand");
  const minuteHand = document.getElementById("minuteHand");
  const secondHand = document.getElementById("secondHand");

  const clockRadius = 195; // باڈی کے حساب سے تھوڑا بڑا کیا

  // --- آڈیو سیٹ اپ ---
  let audioCtx = null;
  let isMuted = true;

  function playTickSound(isTopMinute) {
    if (isMuted) return;
    
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // بالکل اوریجنل ووڈن/مکینیکل ٹک ساؤنڈ
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isTopMinute ? 850 : 480, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.01); // اور بھی کرپپی ساؤنڈ

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.01);
  }

  // بٹن رینڈرنگ
  const clockContainer = document.querySelector(".clock-container") || document.body;
  const muteBtn = document.createElement("button");
  muteBtn.className = "mute-btn";
  muteBtn.innerText = "🔈 Unmute Sound";
  clockContainer.appendChild(muteBtn);

  muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    muteBtn.innerText = isMuted ? "🔈 Unmute Sound" : "🔊 Mute Sound";
    if (!isMuted && !audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  });

  // --- کلاک فیس جنریشن ---
  for (let i = 1; i <= 12; i++) {
    const numberSpan = document.createElement("span");
    numberSpan.textContent = i;
    const angle = (i * 30 * Math.PI) / 180;
    const radiusOffset = clockRadius - 42; 
    const x = clockRadius + radiusOffset * Math.sin(angle);
    const y = clockRadius - radiusOffset * Math.cos(angle);
    numberSpan.style.left = `${x}px`;
    numberSpan.style.top = `${y}px`;
    numbersContainer.appendChild(numberSpan);
  }

  for (let i = 0; i < 60; i++) {
    const tick = document.createElement("div");
    tick.classList.add("tick");
    if (i % 5 === 0) tick.classList.add("major");
    const angle = i * 6;
    tick.style.transformOrigin = `50% ${clockRadius}px`;
    tick.style.transform = `rotate(${angle}deg)`;
    ticksContainer.appendChild(tick);
  }

  // --- ہائی اینڈ مکینیکل موشن اینیمیشن ---
  let lastSecond = -1;

  function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const secondsDegrees = seconds * 6; 
    const minutesDegrees = (minutes * 6) + (seconds * 0.1);
    const hoursDegrees = ((hours % 12) * 30) + (minutes * 0.5);

    // مکینیکل اسپرنگ باؤنس ایفیکٹ (Mechanical Backlash/Snapping)
    if (seconds === 0) {
      secondHand.style.transition = "none"; 
    } else {
      // یہ بیزیئر کرو سوئی کو ہلکا سا آگے جھٹکا دے کر واپس اپنی جگہ پر سیٹ کرتا ہے
      secondHand.style.transition = "transform 0.22s cubic-bezier(0.3, 2.1, 0.5, 0.9)";
    }

    // سوئیاں گھمانا
    secondHand.style.transform = `rotate(${secondsDegrees}deg)`;
    minuteHand.style.transform = `rotate(${minutesDegrees}deg)`;
    hourHand.style.transform = `rotate(${hoursDegrees}deg)`;

    // ساؤنڈ پلے لاجک
    if (seconds !== lastSecond) {
      const isTopMinute = (seconds === 0);
      playTickSound(isTopMinute);
      lastSecond = seconds;
    }

    requestAnimationFrame(updateClock);
  }

  requestAnimationFrame(updateClock);
});
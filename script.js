(() => {
"use strict";
const SOUNDS = {
  normal: {
    name: "เสียงปอดปกติ (Normal breath sounds)",
    audio: "media/normal-sound.mp4",
    video: "media/normal-review.mp4",
    desc: "เสียงหายใจปกติมีลักษณะนุ่มนวล สม่ำเสมอ ไม่เป็นเสียงหวีดหรือเสียงแตกพร่า โดยทั่วไปเสียงหายใจเข้าจะยาวและดังกว่าเสียงหายใจออกเล็กน้อย"
  },
  rhonchi: {
    name: "Rhonchi",
    audio: "media/rhonchi-audio.mp4",
    video: "media/rhonchi-review.mp4",
    desc: "เสียงต่ำ ทุ้ม คล้ายเสียงกรน เสียงครืดคราด หรือคล้ายกับเสียงหายใจใต้น้ำของนักประดาน้ำ มักสัมพันธ์กับสารคัดหลั่งในทางเดินหายใจขนาดใหญ่ และเสียงอาจเปลี่ยนแปลงหรือลดลงหลังไอ"
  },
  stridor: {
    name: "Stridor",
    audio: "media/stridor-audio.mp4",
    video: "media/stridor-review.mp4",
    desc: "เสียงหวีดแหลมต่อเนื่อง คล้ายเสียงผิวปากหรือนกหวีด หรือคล้ายกับเสียงร้องของแมวน้ำ มักได้ยินชัดขณะหายใจออก และสัมพันธ์กับทางเดินหายใจที่ตีบแคบ"
  },
  wheezing: {
    name: "Wheezing",
    audio: "media/wheezing-audio.mp4",
    video: "media/wheezing-review.mp4",
    desc: "เสียงแหลมดังและหยาบคล้ายเสียงหวูด มักได้ยินชัดขณะหายใจเข้า และอาจบ่งชี้การตีบแคบหรืออุดกั้นของทางเดินหายใจส่วนบน"
  },
  crackles: {
    name: "Crepitation / Rales / Crackles",
    audio: "media/crackles-audio.mp4",
    video: "media/crackles-review.mp4",
    desc: "เสียงแตกเป๊าะ ๆ หรือกรอบแกรบเป็นช่วงสั้น ๆ คล้ายเสียงแกะตีนตุ๊กแกหรือเสียงขยี้กันกระแทก ขยี้ถุงพลาสติก มักได้ยินชัดขณะหายใจเข้า โดยอาจสัมพันธ์กับการเปิดของทางเดินหายใจขนาดเล็กหรือมีสารคัดหลั่ง ขึ้นอยู่กับสาเหตุ"
  }
};
const ORDER = ["normal", "rhonchi", "stridor", "wheezing", "crackles"];
const $ = id => document.getElementById(id);
let questions = [];
let index = 0;
let answers = Array(5).fill(null);
let player = null;

function shuffle(list) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function stopAudio() {
  if (!player) return;
  player.pause();
  player.loop = false;
  player.removeAttribute("src");
  player.load();
}
function showAudioError(path) {
  $("feedback").textContent = "เล่นเสียงไม่ได้ กรุณาตรวจสอบไฟล์ " + path;
}
function playCurrentSound(side) {
  const key = questions[index];
  const sound = SOUNDS[key];
  if (!player || !sound) return;
  player.pause();
  player.loop = true;
  player.src = sound.audio;
  player.currentTime = 0;
  player.load();
  const playPromise = player.play();
  if (playPromise && playPromise.catch) {
    playPromise.catch(() => showAudioError(sound.audio));
  }
  document.querySelectorAll(".lung-zone").forEach(path => {
    path.classList.toggle("active", path.dataset.side === side);
  });
}
function sideLabel(side) {
  return side === "left" ? "ปอดซ้ายของภาพ" : "ปอดขวาของภาพ";
}
function renderQuestion() {
  const key = questions[index];
  stopAudio();
  $("qLabel").textContent = `ข้อ ${index + 1} จาก 5`;
  $("bar").style.width = `${index / 5 * 100}%`;
  $("feedback").textContent = "";
  $("lungArea").querySelectorAll(".lung-zone").forEach(p => p.classList.remove("active"));
  $("options").replaceChildren();

  ORDER.forEach(optionKey => {
    const label = document.createElement("label");
    label.className = "opt";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "soundAnswer";
    radio.value = optionKey;
    radio.checked = answers[index] === optionKey;
    radio.addEventListener("change", () => {
      answers[index] = optionKey;
      updateProgress();
      updateSelectedOption();
    });
    const span = document.createElement("span");
    span.textContent = SOUNDS[optionKey].name;
    label.append(radio, span);
    $("options").appendChild(label);
  });

  $("prev").disabled = index === 0;
  $("next").classList.toggle("hidden", index === 4);
  $("submit").classList.toggle("hidden", index !== 4);
  updateProgress();
  updateSelectedOption();
}
function updateSelectedOption() {
  document.querySelectorAll("#options .opt").forEach(label => {
    const radio = label.querySelector("input");
    label.classList.toggle("selected", !!radio && radio.value === answers[index]);
  });
}
function updateProgress() {
  $("answered").textContent = String(answers.filter(a => a !== null).length);
  $("dots").replaceChildren();
  questions.forEach((key, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "dot";
    if (answers[i] !== null) dot.classList.add("done");
    if (i === index) dot.classList.add("current");
    dot.textContent = `ข้อ ${i + 1}${answers[i] !== null ? " ✓" : ""}`;
    dot.setAttribute("aria-label", `ไปข้อ ${i + 1}`);
    dot.addEventListener("click", () => {
      index = i;
      renderQuestion();
    });
    $("dots").appendChild(dot);
  });
}
function addText(parent, tag, text, className) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.textContent = text;
  parent.appendChild(el);
  return el;
}
function submitQuiz() {
  const unanswered = answers.map((a, i) => a === null ? i + 1 : null).filter(Boolean);
  if (unanswered.length) {
    $("feedback").textContent = "กรุณาตอบข้อ " + unanswered.join(", ") + " ก่อนส่งคำตอบ";
    return;
  }
  stopAudio();
  const score = answers.reduce((sum, answer, i) => sum + (answer === questions[i] ? 1 : 0), 0);
  $("quizPage").classList.add("hidden");
  $("results").classList.remove("hidden");
  $("finalScore").textContent = String(score);
  $("finalText").textContent = score === 5
    ? "ยอดเยี่ยม! คุณตอบถูกครบทั้ง 5 ข้อ"
    : `คุณตอบถูก ${score} จาก 5 ข้อ ลองทบทวนคำอธิบายและสื่อประกอบด้านล่าง`;
  $("reviews").replaceChildren();

  questions.forEach((key, i) => {
    const sound = SOUNDS[key];
    const correct = answers[i] === key;
    const article = document.createElement("article");
    article.className = "review";
    addText(article, "h3", `ข้อ ${i + 1}: ${sound.name}`);
    addText(article, "p", correct ? "ผลการตอบ: ถูกต้อง" : `ผลการตอบ: ยังไม่ถูกต้อง · คำตอบของคุณคือ ${SOUNDS[answers[i]].name}`, "answer-status");
    addText(article, "p", "ลักษณะเสียง: " + sound.desc);
    addText(article, "h4", "หลักการจำ");
    const video = document.createElement("video");
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.src = sound.video;
    article.appendChild(video);
    $("reviews").appendChild(article);
  });
  window.scrollTo({top: 0, behavior: "smooth"});
}
function startQuiz() {
  questions = shuffle(ORDER);
  index = 0;
  answers = Array(5).fill(null);
  $("results").classList.add("hidden");
  $("quizPage").classList.remove("hidden");
  renderQuestion();
  window.scrollTo({top: 0, behavior: "smooth"});
}
function init() {
  player = $("player");
  document.querySelectorAll(".lung-zone").forEach(path => {
    path.addEventListener("click", () => playCurrentSound(path.dataset.side));
    path.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        playCurrentSound(path.dataset.side);
      }
    });
  });
  $("prev").addEventListener("click", () => {
    if (index > 0) { index--; renderQuestion(); }
  });
  $("next").addEventListener("click", () => {
    if (index < 4) { index++; renderQuestion(); }
  });
  $("submit").addEventListener("click", submitQuiz);
  $("retry").addEventListener("click", startQuiz);
  startQuiz();
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
})();

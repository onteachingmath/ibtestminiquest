// Updated script.js for animated hints, image loading, and map UI
let currentPart = 'a';
let totalScore = 0;
let questData = null;
const completedParts = {};
const attemptsTracker = {};

async function loadQuest() {
  try {
    const response = await fetch('quests.json');
    const data = await response.json();
    questData = data.quest1;
    questData.image = 'assets/graph2.png';
    loadPart('a');
    document.getElementById("quest-title").textContent = `Quest 1: ${questData.title}`;

    ['b', 'c', 'd'].forEach(part => {
      document.querySelector(`[onclick="loadPart('${part}')"]`).style.pointerEvents = 'none';
      document.querySelector(`[onclick="loadPart('${part}')"]`).style.opacity = 0.3;
    });
  } catch (error) {
    console.error('Error loading quest data:', error);
  }
}

function loadPart(part) {
  currentPart = part;
  const partData = questData.parts[part];
  const subparts = partData.subparts;
  
  if (subparts) {
    const subKeys = Object.keys(subparts);
    const currentSub = subKeys.find(key => !completedParts[`${part}.${key}`]) || subKeys[0];
    const sub = subparts[currentSub];
    document.getElementById("question-content").innerHTML = `<strong>Part ${part}) (${currentSub})</strong> ${sub.prompt} [${sub.points}]`;
    partData.currentSub = currentSub;
  } else {
    document.getElementById("question-content").innerHTML = `<strong>Part ${part})</strong> ${partData.prompt} [${partData.points}]`;
  }

  const questionImage = document.getElementById("question-image");
  const partImage = partData.image || questData.image;
  if (partImage) {
    questionImage.src = partImage;
    questionImage.style.display = 'block';
  } else {
    questionImage.style.display = 'none';
  }

  document.getElementById("hint-text").classList.remove("show");
  document.getElementById("hint-text").innerText = '';
  document.getElementById("user-answer").value = '';
  document.getElementById("feedback").innerText = '';
}

function showHint() {
  const hint = questData.parts[currentPart].hint;
  const hintBox = document.getElementById("hint-text");
  hintBox.innerText = hint;
  hintBox.classList.add("show");
}

function showPopup(message) {
  const popup = document.createElement('div');
  popup.textContent = message;
  popup.style.position = 'fixed';
  popup.style.top = '30%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%, -50%)';
  popup.style.background = '#dff0d8';
  popup.style.border = '2px solid #3c763d';
  popup.style.padding = '20px';
  popup.style.borderRadius = '10px';
  popup.style.zIndex = '1000';
  popup.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 3000);
}

function checkAnswer() {
  const userAnswer = document.getElementById("user-answer").value.trim();
  const feedback = document.getElementById("feedback");
  const partData = questData.parts[currentPart];
  const correctAnswer = partData.subparts ? partData.subparts[partData.currentSub].answer : partData.answer;
  const scoreCell = document.getElementById("score");
  const partsOrder = ['a', 'b', 'c', 'd']; // Moved inside function scope

  attemptsTracker[currentPart] = (attemptsTracker[currentPart] || 0) + 1;

  const acceptableAnswers = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
if (acceptableAnswers.some(ans => ans.replace(/\s+/g, '') === userAnswer.replace(/\s+/g, ''))) {

    if (!completedParts[currentPart]) {
      let pointsEarned = 0;
      if (partData.subparts) {
        const sub = partData.subparts[partData.currentSub];
        pointsEarned = sub.points;
        completedParts[`${currentPart}.${partData.currentSub}`] = true;

        const allDone = Object.keys(partData.subparts).every(key => completedParts[`${currentPart}.${key}`]);
        if (allDone) completedParts[currentPart] = true;
      } else {
        pointsEarned = partData.points;
        completedParts[currentPart] = true;
      }
      totalScore += pointsEarned;
      scoreCell.innerText = totalScore;

      const miniMapItem = document.getElementById(`map-q${partsOrder.indexOf(currentPart)+1}`);
      if (miniMapItem) miniMapItem.classList.add('completed');
    }
    feedback.innerText = '';

    const successMsg = document.createElement('div');
    successMsg.innerText = `✅ Correct! You earned ${partData.subparts ? partData.subparts[partData.currentSub].points : partData.points} point(s).`;
    feedback.appendChild(successMsg);

    const nextButton = document.createElement('button');
    nextButton.id = "next-button";
    nextButton.textContent = "Next ➡️";
    nextButton.style.marginTop = '10px';
    nextButton.onclick = () => advanceToNextPart();
    feedback.appendChild(nextButton);
  } else {
    feedback.innerText = "❌ Try again! Check your calculations or use the hint.";
  }
}

function advanceToNextPart() {
  const partData = questData.parts[currentPart];
  const partsOrder = ['a', 'b', 'c', 'd'];
  
  if (partData.subparts) {
    const subKeys = Object.keys(partData.subparts);
    const nextSub = subKeys.find(key => !completedParts[`${currentPart}.${key}`]);
    if (nextSub) {
      partData.currentSub = nextSub;
      loadPart(currentPart);
      return;
    }
  }
  
  const nextIndex = partsOrder.indexOf(currentPart) + 1;
  if (nextIndex < partsOrder.length) {
    const nextPart = partsOrder[nextIndex];
    const nextButton = document.querySelector(`[onclick="loadPart('${nextPart}')"]`);
    if (nextButton) {
      nextButton.style.pointerEvents = 'auto';
      nextButton.style.opacity = 1;
      showPopup(`🎉 Part ${nextPart.toUpperCase()} unlocked!`);
      setTimeout(() => loadPart(nextPart), 1200);
    }
  }
}

window.onload = () => {
  loadQuest();

  const mapLinks = document.querySelectorAll('.mini-map span');
  const partsOrder = ['a', 'b', 'c', 'd'];
  mapLinks.forEach((node, index) => {
    node.addEventListener('click', () => {
      const part = partsOrder[index];
      if (completedParts[part] || part === 'a') {
        loadPart(part);
      }
    });
  });
};
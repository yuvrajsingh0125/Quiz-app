const API_URL = "https://opentdb.com/api.php?amount=5&difficulty=easy&type=multiple";

let questions = [], currentIndex = 0, score = 0, timeLeft = 15, timer, quizStarted = false;
const questionEl = document.querySelector(".question"), choicesEl = document.querySelector(".choices"), scoreCardEl = document.querySelector(".scoreCard"), nextBtn = document.querySelector(".nextbtn"), timerEl = document.querySelector(".timer");

const startTimer = () => {
  clearInterval(timer);
  timerEl.textContent = timeLeft;
  timer = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timer);
      timer = null;
      if (confirm("Time Up! Restart?")) resetQuiz();
    } else {
      timerEl.textContent = --timeLeft;
    }
  }, 1000);
};

const resetQuiz = () => {
  clearInterval(timer);
  timer = null;
  currentIndex = 0;
  score = 0;
  timeLeft = 15;
  quizStarted = false;
  nextBtn.textContent = "Start Quiz";
  questionEl.innerHTML = "";
  choicesEl.innerHTML = "";
  scoreCardEl.style.display = "none";
  nextBtn.style.display = "block";
};

const fetchQuestions = async () => {
  questionEl.textContent = "Loading...";
  try {
    const res = await fetch(API_URL), data = await res.json();
    if (!data.results.length) throw new Error("No questions found");
    questions = data.results.map(q => ({
      question: q.question,
      options: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5),
      answer: q.correct_answer
    }));
    loadQuestion();
  } catch (err) {
    questionEl.textContent = "Error loading questions.";
  }
};

const loadQuestion = () => {
  if (currentIndex >= questions.length) return showScore();
  timeLeft = 15;
  startTimer();
  const q = questions[currentIndex];
  questionEl.innerHTML = `Q${currentIndex + 1}: ${q.question}`;
  choicesEl.innerHTML = q.options.map(opt => `<button class='choice'>${opt}</button>`).join(" ");
  document.querySelectorAll(".choice").forEach(btn => {
    btn.onclick = () => selectAnswer(btn, q.answer);
    btn.disabled = false;
  });
  nextBtn.textContent = "Next Question";
  nextBtn.style.display = "none";
};

const selectAnswer = (btn, correct) => {
  document.querySelectorAll(".choice").forEach(b => b.disabled = true);
  if (btn.textContent === correct) {
    score++;
    nextBtn.style.display = "block";
  } else {
    alert("Wrong! Try again.");
    document.querySelectorAll(".choice").forEach(b => b.disabled = false);
  }
};

const showScore = () => {
  clearInterval(timer);
  timer = null;
  timeLeft = 15;
  timerEl.textContent = timeLeft;
  questionEl.innerHTML = "Quiz Over!";
  choicesEl.innerHTML = "";
  scoreCardEl.style.display = "block";
  scoreCardEl.innerHTML = `Score: <strong>${score}</strong>/${questions.length}`;
  nextBtn.textContent = "Restart Quiz";
  nextBtn.style.display = "block";
  nextBtn.onclick = resetQuiz;
};

nextBtn.textContent = "Start Quiz";
nextBtn.style.display = "block";
nextBtn.onclick = () => {
  if (!quizStarted) {
    quizStarted = true;
    nextBtn.textContent = "Next Question";
    fetchQuestions();
  } else {
    currentIndex++;
    loadQuestion();
  }
};

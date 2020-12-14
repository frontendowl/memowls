function game(info) {
  const box = document.getElementById(info.boxId);
  const timer = document.getElementById(info.timerId);
  const alert = document.getElementById(info.alertId);

  const cards = Array.from(box.querySelectorAll(info.cardSelector));
  const btns = Array.from(document.querySelectorAll(info.btnSelector));

  const gameTime = info.gameTimeSeconds >= 10 ? info.gameTimeSeconds : 60;
  const startTimeStr = secondsToMMSS(gameTime);

  let firstCard, secondCard, firstUnmatched, secondUnmatched;
  let hasFlippedCard, isNewStart, notWin;
  timer.innerHTML = startTimeStr;

  function newGame() {
    timer.innerHTML = startTimeStr;
    isNewStart = true;
    notWin = true;
    hasFlippedCard = false;
    firstCard = null;
    secondCard = null;
    firstUnmatched = null;
    secondUnmatched = null;

    cards.forEach(card => {
      card.classList.remove(info.flipClass);
      card.classList.remove(info.unmatchedClass);
      card.classList.remove(info.matchedClass);
      card.addEventListener("click", flipCard);
    });

    // flip animation should be finished before shuffle
    setTimeout(shuffle, 600);

    alert.classList.remove("is-open");
    alert.classList.remove(info.loseClass);
    alert.classList.remove(info.winClass);
  }

  function shuffle() {
    cards.forEach(card => {
      let randomPlace = Math.floor(Math.random() * cards.length);
      card.style.order = randomPlace;
    });
  }

  function setTimer() {
    const startTime = Date.now();

    // turn timer on
    const tiktak = setInterval(() => {
      if (notWin) {
        let diff = gameTime - (((Date.now() - startTime) / 1000) | 0);
        timer.innerHTML = secondsToMMSS(diff);
      } else {
        gameOver(info.winClass);
      }
    }, 1000);

    // turn off if time is over
    setTimeout(function() {
      if (
        notWin &&
        (timer.innerHTML === "00:00" || timer.innerHTML === "00:01")
      ) {
        gameOver(info.loseClass);
        timer.innerHTML = "00:00";
        cards.forEach(card => card.removeEventListener("click", flipCard));
      }
    }, 1000 * gameTime);

    function gameOver(result) {
      // stop the timer
      clearInterval(tiktak);
      // show result
      alert.classList.add(result, "is-open");
      isNewStart = true;
    }
  }

  function flipCard() {
    if (isNewStart) {
      isNewStart = false;
      setTimer();
    }
    if (firstUnmatched) {
      firstUnmatched.classList.remove(info.flipClass, info.unmatchedClass);
      secondUnmatched.classList.remove(info.flipClass, info.unmatchedClass);
      firstUnmatched.addEventListener("click", flipCard);
      secondUnmatched.addEventListener("click", flipCard);

      firstUnmatched = null;
      secondUnmatched = null;
    }
    this.classList.add(info.flipClass);

    if (!hasFlippedCard) {
      firstCard = this;
      hasFlippedCard = true;
      return;
    }
    if (this === firstCard) return;

    secondCard = this;
    hasFlippedCard = false;

    checkMatch(firstCard, secondCard);
  }

  function checkMatch(c1, c2) {
    if (c1.dataset.pic === c2.dataset.pic) {
      c1.classList.add(info.matchedClass);
      c2.classList.add(info.matchedClass);
      const matched = box.querySelectorAll("." + info.matchedClass);
      if (matched.length === cards.length) {
        notWin = false;
      }
    } else {
      c1.classList.add(info.unmatchedClass);
      firstUnmatched = c1;
      c2.classList.add(info.unmatchedClass);
      secondUnmatched = c2;
    }
    c1.removeEventListener("click", flipCard);
    c2.removeEventListener("click", flipCard);
    firstCard = null;
    secondCard = null;
  }

  newGame();
  cards.forEach(card => card.addEventListener("click", flipCard));
  btns.forEach(btn => btn.addEventListener("click", newGame));
}

function secondsToMMSS(n) {
  return `${nTo2DigitsString((n / 60) | 0)}:${nTo2DigitsString(n % 60)}`;
}
function nTo2DigitsString(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

// PARAMETERS
// Animation Parameters (in percents of entire animation)
const LOGO_STARTS_INCREASE = 0;
const LOGO_STATIC_TIME = 60; // duration
const LOGO_ENDS_DECREASE = 100;
// time-dependant
const AUTOMATE_ANIMATION_DURATION = 3000; // ms - from 0 to 100 percents
const AUTOMATE_ANIMATION_ITERATION_INTERVAL = 0; // ms - delay between animation end and start
const AUTOMATE_ANIMATION_UPDATE_INTERVAL = 5; // ms - updates state in every 5 milisecond

// Size Parameters
const MIN_SCROLLABLE_LENGTH = 500; // px
let contentHeight = window.top.document.documentElement.scrollHeight;
let innerHeight = window.top.innerHeight;
let scrollableLength = contentHeight - innerHeight;
let scrollState = 1;

// animation type (time or scroll)
let isScrollAnimation = scrollableLength > MIN_SCROLLABLE_LENGTH;

// track user behaviour
let latestTrackedPercentage = 10;
const EPSILON = 1;

$(document).ready(function () {
  setSizeParameters();

  if (scrollableLength < MIN_SCROLLABLE_LENGTH) {
    startTimeAnimation();
  } else {
    const percent = (scrollState / scrollableLength) * 100;
    animateAll(percent);
  }
});

function trackEvent(percentage) {
  const lowerTarget = latestTrackedPercentage - 10;
  const upperTarget = latestTrackedPercentage + 10;
  if (percentage - EPSILON <= lowerTarget) {
    console.log(`Down to ${lowerTarget}%`);
    latestTrackedPercentage = lowerTarget;
    return;
  }
  if (percentage + EPSILON >= upperTarget) {
    console.log(`Up to ${upperTarget}%`);
    latestTrackedPercentage = upperTarget;
    return;
  }
}

function setSizeParameters() {
  contentHeight = window.top.document.documentElement.scrollHeight;
  innerHeight = window.top.innerHeight;
  scrollableLength = contentHeight - innerHeight;
  scrollState = window.top.document.body.scrollTop || window.top.document.documentElement.scrollTop;
  const adHeight = $("#container").height();
  if (scrollableLength > 5 * adHeight) {
    scrollableLength = 5 * adHeight;
  }
  isScrollAnimation = scrollableLength > MIN_SCROLLABLE_LENGTH;
}

// scroll-independant
// time-dependant
function startTimeAnimation() {
  if (!isScrollAnimation) {
    const initialTimestamp = new Date().getTime();
    animInterval = setInterval(() => {
      const timestamp = new Date().getTime();
      const percent =
        (((timestamp - initialTimestamp) % (AUTOMATE_ANIMATION_DURATION + AUTOMATE_ANIMATION_ITERATION_INTERVAL)) * 100) / AUTOMATE_ANIMATION_DURATION;
      animateAll(percent);
    }, AUTOMATE_ANIMATION_UPDATE_INTERVAL);
  }
}

var container = $("#container"),
  maxWidth,
  maxHeight;

$(window).on("load", function () {
  maxWidth = container.width();
  maxHeight = container.height();
  contentScale();
});

function contentScale() {
  var $window = $(window);
  var width = $window.width();
  var height = $window.height();
  var scale;
  container.css({
    "-webkit-transform-origin": "0 0",
    "-moz-transform-origin": "0 0",
    "transform-origin": "0 0",
  });

  scale = Math.min(width / maxWidth, height / maxHeight);
  container.css({
    "-webkit-transform": "scale(" + scale + ")",
    "-moz-transform": "scale(" + scale + ")",
    transform: "scale(" + scale + ")",
  });
}

$(window).resize(function (evt) {
  contentScale();
});
$(window.top).resize(function (evt) {
  setSizeParameters();
});

function updateScrollState() {
  scrollState = window.top.document.body.scrollTop || window.top.document.documentElement.scrollTop;
}

window.top.onscroll = function () {
  updateScrollState();
  const percent = (scrollState / scrollableLength) * 100;
  animateAll(percent);
};

function linearChange(startValue, endValue, startTime, endTime, currentTime, beforeValue, afterValue) {
  if (currentTime < startTime) {
    return typeof beforeValue === "number" ? beforeValue : startValue;
  }
  if (currentTime > endTime) {
    return typeof afterValue === "number" ? afterValue : endValue;
  }
  const speed = (endValue - startValue) / (endTime - startTime);
  return startValue + speed * (currentTime - startTime);
}

function symmetricChange(edgeValue, centerValue, startTime, endTime, currentTime, staticPeriod = 0, beforeValue, afterValue) {
  let breakingPoint1;
  let breakingPoint2;
  if (currentTime < startTime) {
    return typeof beforeValue === "number" ? beforeValue : edgeValue;
  }
  if (currentTime > endTime) {
    return typeof afterValue === "number" ? afterValue : edgeValue;
  }

  if (staticPeriod > 0) {
    breakingPoint1 = startTime + (endTime - startTime - staticPeriod) / 2;
    breakingPoint2 = breakingPoint1 + staticPeriod;
    if (currentTime > breakingPoint1 && currentTime < breakingPoint2) {
      return centerValue;
    }
  }

  const speed = (2 * (centerValue - edgeValue)) / (endTime - startTime - staticPeriod);
  const distance = Math.min(Math.abs(currentTime - startTime), Math.abs(currentTime - endTime));
  return edgeValue + distance * speed;
}

function animateAll(percent) {
  trackEvent(percent);
  // TO DO
  // CALL YOUR ANIMATIONS AS BELOW
  animateLogo(percent);
  animateBackground(percent);
}

// TO DO
// ADD ANIMATIONS AS BELOW
function animateLogo(percent) {
  const logoSize = symmetricChange(180, 300, LOGO_STARTS_INCREASE, LOGO_ENDS_DECREASE, percent, LOGO_STATIC_TIME);

  gsap.to("#logo", {
    duration: 0,
    width: logoSize,
  });
}

function animateBackground(percent) {
  const BACKGROUND_STARTS_ROTATION = (LOGO_STARTS_INCREASE + LOGO_ENDS_DECREASE - LOGO_STATIC_TIME) / 2;
  const BACKGROUND_ENDS_ROTATION = BACKGROUND_STARTS_ROTATION + LOGO_STATIC_TIME / 2;
  const bgDeg = linearChange(-30, 330, BACKGROUND_STARTS_ROTATION, BACKGROUND_ENDS_ROTATION, percent);

  gsap.to("#container", {
    duration: 0,
    "--d": `${bgDeg}deg`,
  });
}

document.addEventListener('DOMContentLoaded', function () {

  var $canvas = document.getElementById("lc");

  // State
  var $figure,
      $genId,
      $step,
      $width,
      $height,
      $pixelOffX,
      $pixelOffY,
      $cellSize,
      $showGrid,
      $autoevolve,
      $period,
      $firstPeriodStep,
      $history,
      $speedIndex = 3, // Generations per second
      $lastEvoTime,
      $diedOut,
      $notice = "";


  var speedOptions = [2, 5, 10, 20, 30, 60, 100];

  var $actionsList = [],
      $evoCache = {};

  var isDragging = false, isMouseDown = false, dragX, dragY;

  var
      maxHistoryDepth = 312,
      minHistoryDepth = 15;

  var worker = new Worker('worker.js');

  worker.addEventListener('message', function (e) {
    console.log("[WORKER] Received new evolution")
    $evoCache[e.data.genId] = e.data.figure;
  }, false);

  var PATTERNS = {
    glider: {name: "Glider", pattern: [[2, 1], [3, 2], [1, 3], [2, 3], [3, 3]]},
    glidergun: {
      name: "Glider Gun",
      pattern: [[5, 6], [6, 6], [6, 7], [5, 7], [15, 6], [15, 7], [15, 8], [16, 5], [17, 4], [18, 4], [16, 9], [17, 10], [18, 10], [19, 7], [21, 6], [21, 7], [21, 8], [20, 5], [20, 9], [22, 7], [25, 6], [26, 6], [25, 5], [26, 5], [25, 4], [26, 4], [27, 3], [27, 7], [29, 7], [29, 8], [29, 3], [29, 2], [39, 4], [40, 4], [40, 5], [39, 5]]
    },
    glidergun_eater: {
      name: "Glider Gun with Eater",
      pattern: [[5, 6], [6, 6], [6, 7], [5, 7], [15, 6], [15, 8], [15, 7], [16, 5], [17, 4], [18, 4], [20, 5], [19, 7], [21, 6], [16, 9], [17, 10], [18, 10], [21, 7], [22, 7], [20, 9], [21, 8], [43, 26], [44, 26], [43, 27], [45, 27], [45, 28], [45, 29], [46, 29], [25, 4], [25, 6], [26, 4], [26, 5], [26, 6], [27, 3], [25, 5], [27, 7], [29, 2], [29, 3], [29, 7], [29, 8], [39, 4], [40, 4], [40, 5], [39, 5]]
    },
    pentadecathlon: {
      name: "Pentadecathlon (period 15)",
      pattern: [[2, 2], [3, 2], [4, 1], [4, 3], [5, 2], [6, 2], [7, 2], [8, 2], [9, 1], [9, 3], [10, 2], [11, 2]]
    },
    centinal: {
      name: "Centinal (period 100)",
      pattern: [[1, 1], [2, 1], [2, 2], [2, 3], [3, 4], [4, 4], [4, 3], [4, 14], [4, 15], [3, 14], [2, 15], [2, 16], [2, 17], [1, 17], [13, 4], [13, 5], [12, 5], [12, 6], [11, 6], [12, 7], [13, 7], [16, 7], [13, 14], [13, 13], [12, 13], [12, 12], [11, 12], [12, 11], [13, 11], [16, 11], [26, 4], [27, 4], [26, 3], [27, 3], [26, 14], [27, 14], [26, 15], [27, 15], [40, 4], [41, 4], [40, 5], [42, 5], [42, 6], [42, 7], [41, 7], [40, 7], [40, 11], [41, 11], [42, 11], [42, 12], [42, 13], [41, 14], [40, 14], [40, 13], [49, 4], [50, 4], [49, 3], [51, 3], [51, 2], [51, 1], [52, 1], [49, 14], [50, 14], [49, 15], [51, 15], [51, 16], [51, 17], [52, 17], [17, 11], [17, 7]]
    },
    r_pentomino: {name: "R-pentomino", pattern: [[1, 1], [1, 2], [2, 1], [1, 3], [0, 2]]},
    max: {
      name: "Max (space filler) - slow!",
      pattern: [[6, 9], [6, 10], [6, 11], [6, 15], [6, 16], [6, 17], [7, 9], [7, 17], [7, 14], [7, 12], [8, 9], [9, 9], [8, 17], [9, 17], [7, 20], [8, 20], [8, 21], [9, 21], [10, 21], [8, 22], [9, 22], [8, 23], [9, 23], [10, 10], [11, 10], [10, 12], [11, 12], [10, 14], [11, 14], [10, 16], [11, 16], [12, 11], [12, 15], [13, 10], [13, 11], [13, 12], [13, 13], [13, 14], [13, 15], [13, 16], [12, 21], [13, 22], [13, 23], [13, 24], [13, 25], [13, 26], [12, 26], [11, 25], [11, 24], [11, 23], [10, 25], [13, 27], [14, 27], [15, 27], [14, 28], [15, 22], [15, 23], [16, 21], [16, 24], [17, 23], [18, 24], [18, 25], [16, 25], [17, 25], [18, 26], [19, 26], [20, 26], [21, 25], [22, 24], [22, 23], [21, 21], [21, 20], [22, 20], [23, 20], [23, 21], [20, 22], [19, 20], [18, 20], [19, 19], [19, 18], [15, 13], [16, 12], [16, 14], [17, 13], [17, 15], [16, 16], [15, 16], [15, 17], [16, 18], [17, 18], [17, 17], [19, 17], [19, 16], [19, 15], [15, 9], [15, 10], [16, 10], [17, 10], [17, 9], [19, 14], [19, 13], [19, 12], [19, 11], [19, 10], [20, 10], [18, 8], [16, 7], [16, 6], [17, 5], [18, 4], [19, 4], [20, 4], [20, 5], [21, 5], [22, 5], [20, 6], [21, 7], [22, 6], [23, 7], [23, 8], [22, 9], [22, 18], [21, 17], [22, 16], [23, 17], [21, 15], [22, 14], [23, 14], [23, 13], [22, 12], [21, 12], [21, 13], [25, 20], [25, 19], [25, 18], [25, 17], [25, 16], [25, 15], [25, 14], [26, 15], [26, 19], [27, 14], [28, 14], [27, 16], [28, 16], [27, 18], [28, 18], [27, 20], [28, 20], [29, 21], [30, 21], [31, 21], [32, 21], [32, 20], [32, 19], [31, 18], [31, 16], [32, 15], [32, 14], [32, 13], [31, 13], [30, 13], [29, 13], [25, 8], [25, 7], [26, 9], [25, 6], [25, 5], [25, 4], [25, 3], [26, 4], [24, 3], [23, 3], [24, 2], [27, 5], [27, 6], [27, 7], [28, 5], [28, 9], [29, 9], [30, 9], [29, 8], [29, 7], [30, 7], [30, 8], [30, 10], [31, 10]]
    },
    random: {
      name: "Random soup (33%)"
    }
  };

  function fillInPatternList() {
    var ul = document.getElementsByClassName("patterns")[0], li, a, pattern, text;
    for (var key in PATTERNS) {
      pattern = PATTERNS[key];
      li = document.createElement("LI");
      a = document.createElement("A");
      a.href = "#" + key;
      a.innerHTML = pattern.name;
      li.appendChild(a);
      ul.appendChild(li);
    }

    var links = document.querySelectorAll(".patterns li a");
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", function (e) {
        e.preventDefault();
        window.location.replace(e.target.href);
        $actionsList.push(["detectPatternFromHash"]);
      })
    }

  }

  function setState(newst) {
    var oldGenId = $genId;

    $figure = newst.figure;
    $genId = newst.genId;
    $step = newst.step;
    $width = newst.width;
    $height = newst.height;
    $pixelOffX = newst.pixelOffX;
    $pixelOffY = newst.pixelOffY;
    $cellSize = newst.cellSize;
    $showGrid = newst.showGrid;
    $autoevolve = newst.autoevolve;
    $period = newst.period;
    $firstPeriodStep = newst.firstPeriodStep;
    $history = newst.history;
    $speedIndex = newst.speedIndex;
    $lastEvoTime = newst.lastEvoTime;
    $diedOut = newst.diedOut;

    if ($genId && $genId !== oldGenId) {
      worker.postMessage({genId: $genId, figure: $figure});
    }
  }

  function wantsToStopEvolution(message) {
    return !$autoevolve || $autoevolve && window.confirm(message)
  }

  function detectPatternFromHash() {
    loadPattern(window.location.hash.substr(1));
  }

  function generateNewId() {
    return new Date().valueOf();
  }

  function loadPattern(name) {
    var pattern = PATTERNS[name],
        percent = 0.33;
    if (pattern) {
      if (wantsToStopEvolution("Evolution is in progress. Do you want to stop it?")) {
        var newPattern = pattern.pattern, newCell, newCellSize = 18;
        if (!newPattern) {
          newPattern = [];
          var widthInCells = Math.floor($width / $cellSize),
              heightInCells = Math.floor($height / $cellSize),
              area = widthInCells * heightInCells,
              i = 0;
          while (i <= (area * percent)) {
            newCell = [
              Math.floor(Math.random() * widthInCells),
              Math.floor(Math.random() * heightInCells)
            ];
            if (!inArray(newCell, newPattern)) {
              newPattern.push(newCell);
              i++;
            }
          }
          newCellSize = $cellSize;
        }
        // slice(0) is array cloning
        else newPattern = newPattern.slice(0);
        setState(
            {
              figure: newPattern,
              genId: generateNewId(),
              step: 0,
              width: window.innerWidth,
              height: window.innerHeight,
              pixelOffX: $pixelOffX ? $pixelOffX : -1,
              pixelOffY: $pixelOffY ? $pixelOffY : -1,
              cellSize: newCellSize,
              showGrid: true,
              autoevolve: false,
              period: 0,
              firstPeriodStep: null,
              history: [newPattern],
              speedIndex: $speedIndex,
              lastEvoTime: null,
              diedOut: false
            }
        );
        autoCenter();
        fitToScreen();
      }
    }
  }

  function processClear() {
    if (wantsToStopEvolution("Evolution is in progress. Do you want to clear the field?")) {
      history.replaceState("", document.title, window.location.pathname + window.location.search);
      resetState();
    }
  }

  function resetState() {
    setState(
        {
          figure: [],
          genId: null,
          step: 0,
          width: window.innerWidth,
          height: window.innerHeight,
          pixelOffX: $pixelOffX ? $pixelOffX : -1,
          pixelOffY: $pixelOffY ? $pixelOffY : -1,
          cellSize: 18,
          showGrid: true,
          autoevolve: false,
          period: 0,
          firstPeriodStep: null,
          history: [],
          speedIndex: $speedIndex,
          lastEvoTime: null,
          diedOut: false
        }
    )
  }

  $canvas.addEventListener("mousedown", function (e) {
    if (e.which === 1) { // Ignore right button
      e.preventDefault();
      dragX = e.clientX;
      dragY = e.clientY;
      isMouseDown = true;
      document.addEventListener("mousemove", processDrag);
    }
  });

  document.addEventListener("mouseup", function (e) {
    e.preventDefault();
    document.removeEventListener("mousemove", processDrag);
    document.body.style.cursor = "default";
    if (isDragging) {
    }
    else {
      if (isMouseDown && e.which === 1) processClick(e);
    }
    isMouseDown = false;
    isDragging = false;
  });

  $canvas.addEventListener("touchstart", function (e) {
    // Commented out because it breaks clicking cells
    // But it causes ugly shadows when scrolling.
    // If we uncomment, on iOS we can emulate clicking the different way
    // But on Android it's a pain.
    // PS: shadows on page edges on dragging seem to be fixed by user-scalable=0
    //e.preventDefault();

    dragX = e.touches[0].pageX;
    dragY = e.touches[0].pageY;
    isMouseDown = true;
  });

  $canvas.addEventListener("touchend", function (e) {
    // Commented out because it breaks clicking cells
    // But it causes ugly shadows when scrolling.
    // If we uncomment, on iOS we can emulate clicking the different way
    // But on Android it's a pain.
    // PS: shadows on page edges on dragging seem to be fixed by user-scalable=0
    //e.preventDefault();
    isMouseDown = null;
    isDragging = null;
  });

  $canvas.addEventListener("touchcancel", function (e) {
    isMouseDown = null;
    isDragging = null;
  });

  document.addEventListener("touchmove", processDrag);

  function processDrag(e) {
    if (isMouseDown) {
      var touch = e.type === "touchmove";
      e.preventDefault();
      document.body.style.cursor = "move";
      isDragging = true;
      var newX = touch ? e.touches[0].pageX : e.clientX,
          newY = touch ? e.touches[0].pageY : e.clientY;
      $actionsList.push(["changeOffset", $pixelOffX + newX - dragX, $pixelOffY + newY - dragY]);
      dragX = newX;
      dragY = newY;
    }
  }

  var scrollData = {delta: 0, timestamp: null};

  function sign(x) {
    return x > 0 ? 1 : x < 0 ? -1 : 0;
  }

  document.addEventListener("wheel", function (e) {
    var delta = e.deltaY, timestamp = e.timeStamp;

    if (delta === 0) {
      scrollData = {delta: 0, timestamp: null};
      return true;
    }

    if (scrollData.timestamp === null || (timestamp - scrollData.timestamp) > 1000 || sign(scrollData.delta) !== sign(delta)) {
      scrollData = {delta: delta, timestamp: timestamp};
      return true;
    }
    else {
      scrollData.delta += delta;
    }

    if ((timestamp - scrollData.timestamp) > 70 && Math.abs(scrollData.delta) > 3) {
      if (delta > 3)
        $actionsList.push(["zoomOut", [e.clientX, e.clientY]]);
      else if (delta < -3)
        $actionsList.push(["zoomIn", [e.clientX, e.clientY]]);
      scrollData = {delta: 0, timestamp: null};
    }
  });

  window.addEventListener('resize', function () {
    $actionsList.push(["resizeCanvas"])
  });

  window.addEventListener('orientationchange', function () {
    $actionsList.push(["resizeCanvas"])
  });

  document.getElementById("stepBtn").addEventListener("click", function () {
    $actionsList.push(["step"])
  });

  document.getElementById("clearBtn").addEventListener("click", function () {
    $actionsList.push(["reset"])
  });

  document.getElementById("goBtn").addEventListener("click", function () {
    $actionsList.push(["startEvolution"])
  });

  document.getElementById("stopBtn").addEventListener("click", function () {
    $actionsList.push(["stopEvolution"])
  });

  document.getElementById("btnFit").addEventListener("click", function () {
    $actionsList.push(["fitToScreen"])
  });

  document.getElementById("plusSize").addEventListener("click", function () {
    $actionsList.push(["zoomIn"])
  });

  document.getElementById("minusSize").addEventListener("click", function () {
    $actionsList.push(["zoomOut"])
  });

  document.getElementById("btnFaster").addEventListener("click", function () {
    $speedIndex = Math.min($speedIndex + 1, speedOptions.length - 1);
  });

  document.getElementById("btnSlower").addEventListener("click", function () {
    $speedIndex = Math.max($speedIndex - 1, 0);
  });

  function processClick(e) {
    var x = e.clientX, y = e.clientY,
        pixelX = x - $canvas.offsetLeft - 1,
        pixelY = y - $canvas.offsetTop - 1;
    if (pixelX >= 0 && pixelX <= $width &&
        pixelY >= 0 && pixelY <= $height) {
      if (clickInCell(pixelX, pixelY)) {
        var cellCoords = pixelToCellCoords(pixelX, pixelY);
        var cx = cellCoords.x,
            cy = cellCoords.y;
        $actionsList.push(["toggleCell", cx, cy])
      }
    }
  }

  function clickInCell(pixelX, pixelY) {
    // Check that click is not on the grid, but only if the grid is shown
    return !(doShowGrid() && (pixelX - $pixelOffX) % $cellSize === 0 || (pixelY - $pixelOffY) % $cellSize === 0)
  }

  function speed() {
    return speedOptions[$speedIndex];
  }

  function update() {
    var actions = $actionsList,
        action;
    $actionsList = [];
    for (var i = 0; i < actions.length; i++) {
      action = actions[i];
      switch (action[0]) {
        case "detectPatternFromHash":
          detectPatternFromHash();
          break;
        case "step":
          if (!$autoevolve)
            processStep();
          break;
        case "startEvolution":
          if (!$autoevolve)
            startEvolution();
          break;
        case "stopEvolution":
          stopEvolution();
          break;
        case "toggleCell":
          toggleCell(action[1], action[2]);
          break;
        case "changeOffset":
          changeOffset(action[1], action[2]);
          break;
        case "zoomIn":
          zoomCell($cellSize * 1.6, action[1]);
          break;
        case "zoomOut":
          zoomCell($cellSize / 1.6, action[1]);
          break;
        case "fitToScreen":
          fitToScreen();
          break;
        case "resizeCanvas":
          resizeCanvas();
          break;
        case "reset":
          processClear();
          break;
        default:
          ;
      }
    }
    if ($autoevolve) {
      var stepsToGo = 0;
      if (!$lastEvoTime) {
        stepsToGo = 1;
      }
      else {
        var delta = (Date.now() - $lastEvoTime);
        console.log("Delta " + delta + " ms");
        stepsToGo = Math.floor(speed() * delta / 1000);
      }
      console.log("Steps to go: " + stepsToGo);
      var j = 0, startTime = Date.now(), el_time, stepBefore;
      while (j < stepsToGo && (!el_time || el_time < (1000 / speed()))) {
        stepBefore = $step;
        processStep();
        if ($step > stepBefore) j++;
        el_time = Date.now() - startTime;
        //console.log("Elapsed: " + el_time + " ms");
        console.log("Step: " + $step)
      }
      console.log("Steps done: " + j);
    }
  }

  function resizeCanvas() {
    var newWidth = window.innerWidth,
        newHeight = window.innerHeight;

    var widthDiff = newWidth - $width,
        heightDiff = newHeight - $height,
        newPixelOffX = $pixelOffX + (widthDiff / 2),
        newPixelOffY = $pixelOffY + (heightDiff / 2);

    setState({
      figure: $figure,
      genId: $genId,
      step: $step,
      width: newWidth,
      height: newHeight,
      pixelOffX: newPixelOffX,
      pixelOffY: newPixelOffY,
      cellSize: $cellSize,
      showGrid: $showGrid,
      autoevolve: $autoevolve,
      period: $period,
      firstPeriodStep: $firstPeriodStep,
      history: $history,
      speedIndex: $speedIndex,
      lastEvoTime: $lastEvoTime,
      diedOut: $diedOut
    });
  }

  function autoCenter() {

    var minX = $figure[0][0], minY = $figure[0][1], maxX = $figure[0][0], maxY = $figure[0][1];

    for (var i = 1; i < $figure.length; i++) {
      minX = Math.min(minX, $figure[i][0]);
      maxX = Math.max(maxX, $figure[i][0]);
      minY = Math.min(minY, $figure[i][1]);
      maxY = Math.max(maxY, $figure[i][1]);
    }

    var cellsNumWidth = maxX - minX + 1,
        cellNumHeight = maxY - minY + 1,
        pixelWidth = cellsNumWidth * $cellSize,
        pixelHeight = cellNumHeight * $cellSize,
        newRel = Math.min($width / pixelWidth, $height / pixelHeight);

    var
        newPixelOffX = Math.round(($width - pixelWidth) / 2 - minX * $cellSize),
        newPixelOffY = Math.round(($height - pixelHeight) / 2 - minY * $cellSize);

    changeOffset(newPixelOffX, newPixelOffY);
  }

  function fitToScreen() {

    if ($figure.length === 0) return false;

    var minX = $figure[0][0], minY = $figure[0][1], maxX = $figure[0][0], maxY = $figure[0][1];

    for (var i = 1; i < $figure.length; i++) {
      minX = Math.min(minX, $figure[i][0]);
      maxX = Math.max(maxX, $figure[i][0]);
      minY = Math.min(minY, $figure[i][1]);
      maxY = Math.max(maxY, $figure[i][1]);
    }

    // Additional margin to improve autofit feel
    minX -= 0.7;
    maxX += 0.7;
    minY -= 0.7;
    maxY += 0.7;

    var cellsNumWidth = maxX - minX + 1,
        cellNumHeight = maxY - minY + 1,
        pixelWidth = cellsNumWidth * $cellSize,
        pixelHeight = cellNumHeight * $cellSize,
        newRel = Math.min($width / pixelWidth, $height / pixelHeight);

    var screenMinX = Math.floor(-$pixelOffX / $cellSize),
        screenMinY = Math.floor(-$pixelOffY / $cellSize),
        screenMaxX = Math.ceil(($width - $pixelOffX) / $cellSize),
        screenMaxY = Math.ceil(($height - $pixelOffY) / $cellSize);

    if (minX < screenMinX || minY < screenMinY || maxX > screenMaxX || maxY > screenMaxY) {
      //var units = 10;
      var oldPixelX = $pixelOffX,
          oldPixelY = $pixelOffY,
          newPixelOffX = Math.round(($width - pixelWidth) / 2 - minX * $cellSize),
          newPixelOffY = Math.round(($height - pixelHeight) / 2 - minY * $cellSize);
      //diffX = (newPixelOffX - $pixelOffX) / units,
      //diffY = (newPixelOffY - $pixelOffY) / units;
      // if (move) {
      //   var j = 1;
      //   var smoothCenter = function () {
      //     $pixelOffX = oldPixelX + Math.floor(diffX * j);
      //     $pixelOffY = oldPixelY + Math.floor(diffY * j);
      //     redrawState();
      //     j++;
      //     if (j < units) setTimeout(smoothCenter, 1000 / 60);
      //     else {
      //       if (newRel < 1) setTimeout(function () {
      //         calcNewScale($cellSize * newRel);
      //         redrawState();
      //       }, 100)
      //     }
      //   };
      //   smoothCenter();
      // }
      changeOffset(newPixelOffX, newPixelOffY);
      if (newRel < 1) zoomCell($cellSize * newRel);

    }
  }

  function zoomCell(newCellSize, coords) {
    var centerDotScaleX, centerDotScaleY;
    if (coords === undefined) {
      centerDotScaleX = 0.5;
      centerDotScaleY = 0.5;
    }
    else {
      centerDotScaleX = coords[0] / $width;
      centerDotScaleY = coords[1] / $height;
    }

    var newFutureCellSize = newCellSize;
    //if (newFutureCellSize >= 5) newFutureCellSize = Math.round(newFutureCellSize);
    var scale = newFutureCellSize / $cellSize,
        newPixelOffX = ($width * centerDotScaleX) * (1 - scale) + (scale * $pixelOffX),
        newPixelOffY = ($height * centerDotScaleY) * (1 - scale) + (scale * $pixelOffY);
    setState(
        {
          figure: $figure,
          genId: $genId,
          step: $step,
          width: $width,
          height: $height,
          pixelOffX: newPixelOffX,
          pixelOffY: newPixelOffY,
          cellSize: newFutureCellSize,
          showGrid: $showGrid,
          autoevolve: $autoevolve,
          period: $period,
          firstPeriodStep: $firstPeriodStep,
          history: $history,
          speedIndex: $speedIndex,
          lastEvoTime: $lastEvoTime,
          diedOut: $diedOut
        }
    );
  }

  function doShowGrid() {
    return $showGrid && $cellSize >= 4
  }

  function changeOffset(newPixelOffX, newPixelOffY) {
    setState(
        {
          figure: $figure,
          genId: $genId,
          step: $step,
          width: $width,
          height: $height,
          pixelOffX: newPixelOffX,
          pixelOffY: newPixelOffY,
          cellSize: $cellSize,
          showGrid: $showGrid,
          autoevolve: $autoevolve,
          period: $period,
          firstPeriodStep: $firstPeriodStep,
          history: $history,
          speedIndex: $speedIndex,
          lastEvoTime: $lastEvoTime,
          diedOut: $diedOut
        }
    );
  }

  function pixelToCellCoords(pixelX, pixelY) {
    return {
      x: Math.floor((pixelX - $pixelOffX) / $cellSize),
      y: Math.floor((pixelY - $pixelOffY) / $cellSize)
    }
  }

  var render = function () {

    function drawPoint(ctx, x, y) {
      var radiusDiff = 1;
      ctx.fillStyle = "#196F3D";
      if (doShowGrid()) {
        var canvasCenterX = (x * $cellSize) + $pixelOffX + $radius + radiusDiff,
            canvasCenterY = (y * $cellSize) + $pixelOffY + $radius + radiusDiff;
        ctx.beginPath();
        ctx.arc(canvasCenterX, canvasCenterY, $radius, 0, 2 * Math.PI);
        ctx.fill();
      }
      else {
        var topX = (x * $cellSize) + $pixelOffX + radiusDiff,
            topY = (y * $cellSize) + $pixelOffY + radiusDiff;
        ctx.fillRect(topX, topY, $cellSize, $cellSize);
      }
    }

    // Find canvas
    var ctx = $canvas.getContext("2d");

    $canvas.width = $width;
    $canvas.height = $height;

    var radiusDiff = 1;

    var $radius = ($cellSize - radiusDiff) / 2;

    // Clear canvas
    ctx.clearRect(0, 0, $width, $height);

    // Draw grid
    if (doShowGrid()) {
      var offRemainderX = $pixelOffX % $cellSize,
          offRemainderY = $pixelOffY % $cellSize;

      ctx.beginPath();
      ctx.strokeStyle = 'lightblue';
      ctx.lineWidth = 1;
      for (var rx = 0.5 + offRemainderX; rx < $width; rx = rx + $cellSize) {
        ctx.moveTo(rx, 0);
        ctx.lineTo(rx, $height);
      }
      for (var ry = 0.5 + offRemainderY; ry < $height; ry = ry + $cellSize) {
        ctx.moveTo(0, ry);
        ctx.lineTo($width, ry);
      }
      ctx.stroke();
    }

    // Draw points
    var point,
        visibleMin = pixelToCellCoords(0, 0),
        visibleMax = pixelToCellCoords($width - 1, $height - 1);

    for (var i = 0; i < $figure.length; i++) {
      point = $figure[i];
      var x = Math.floor(point[0]), y = Math.floor(point[1]);
      if (x >= visibleMin.x && x <= visibleMax.x && y >= visibleMin.y && y <= visibleMax.y) {
        drawPoint(ctx, x, y);
        //console.log(x + " ; " + y);
      }
    }

    // Show step and size
    document.getElementById("stepNum").innerHTML = $step;
    document.getElementById("sizeNum").innerHTML = $figure.length;

    document.getElementById("showSpeed").innerHTML = speed() + " gen/s";

    if ($period === 1) {
      if ($step === 0)
        showNotice("Population is stable.");
      else
        showNotice("Population has stabilized on step " + $step + ".");
    }
    else if ($period > 1) {
      showNotice("Population is oscillating with period " + $period + " (step " + $firstPeriodStep + " = step " + ($firstPeriodStep - $period) + ").");
    }
    else {
      if ($diedOut) showNotice("Population has died out.");
      else dropNotice();
    }
    //console.log(Math.round(fps) + " FPS");
  };

  function showNotice(text) {
    if (text !== $notice) {
      var notice = document.getElementById("notice");
      notice.innerHTML = text;
      notice.style.display = "block";
      notice.style.left = ($width - notice.clientWidth) / 2 + "px";
      $notice = text;
    }
  }

  function dropNotice() {
    if ($notice !== "") {
      var notice = document.getElementById("notice");
      notice.innerHTML = "";
      notice.style.display = "none";
      $notice = "";
    }
  }

  function processStep() {
    // If config is empty initially, just ignore.
    if ($figure.length === 0) return false;
    if ($period === 1) return false;
    var
        newStep = $step, newPeriod = $period, newHistory = $history,
        newAutoEvolve = $autoevolve, newFirstPeriodStep = $firstPeriodStep,
        historyDepth = $figure.length > 650 ? minHistoryDepth : maxHistoryDepth,
        newLastEvoTime = newAutoEvolve ? Date.now() : null; // We record the time evolution started, not when it ended.


    var newFigure;
    if ($period === 0) {
      if ($figure.length < 3) newFigure = [];
      else newFigure = getEvolution($genId);
      if (!newFigure) return false;
    }
    // NOTE: history.length is effectively first period step?
    else newFigure = $history[$history.length - $period + ($step + 1) % $period];


    // Check if it has period
    if (newPeriod === 0) {
      var histT1 = Date.now();
      newPeriod = figureInHistory(newFigure);
      var histT2 = Date.now();
      //console.log("History lookup took: " + (histT2 - histT1) + " ms")
    }

    if (newPeriod !== 1)
      newStep++;

    if (newPeriod === 0) {
      newHistory.push(newFigure);
      newHistory.splice(0, newHistory.length - historyDepth);
    }
    else {
      if (newPeriod === 1) {
        newHistory = [];
      }
      if (!newFirstPeriodStep)
        newFirstPeriodStep = newStep;
    }
    if (newPeriod === 1 || newFigure.length === 0) newAutoEvolve = false;
    setState({
      figure: newFigure,
      genId: (newFigure.length > 2 && !newPeriod) ? generateNewId() : null,
      step: newStep,
      width: $width,
      height: $height,
      pixelOffX: $pixelOffX,
      pixelOffY: $pixelOffY,
      cellSize: $cellSize,
      showGrid: $showGrid,
      autoevolve: newAutoEvolve,
      period: newPeriod,
      firstPeriodStep: newFirstPeriodStep,
      history: newHistory,
      speedIndex: $speedIndex,
      lastEvoTime: newLastEvoTime,
      diedOut: newFigure.length === 0
    });
    if (document.getElementById("autoFit").checked) $actionsList.push(["fitToScreen"]);
  }

  function getEvolution(genId) {
    var newFigure = $evoCache[genId];
    if (newFigure) {
      $evoCache[genId] = null;
    }
    return newFigure;
  }

  function figureInHistory(figure) {
    var historicStep, result;
    for (var h = $history.length - 1; h >= 0; h--) {
      historicStep = $history[h];
      if (figure.length !== historicStep.length) continue;
      result = true;
      for (var i = 0; i < figure.length; i++) {
        if (!inArray(figure[i], historicStep)) {
          result = false;
          break
        }
      }
      if (result) {
        return $history.length - h;
      }
    }
    return 0;
  }

  function startEvolution() {
    // If config is empty initially, just ignore.
    if ($figure.length === 0) return false;
    setState({
      figure: $figure,
      genId: $genId,
      step: $step,
      width: $width,
      height: $height,
      pixelOffX: $pixelOffX,
      pixelOffY: $pixelOffY,
      cellSize: $cellSize,
      showGrid: $showGrid,
      // Do not autoevolve if population is stable
      autoevolve: $period !== 1,
      period: $period,
      firstPeriodStep: $firstPeriodStep,
      history: $history,
      speedIndex: $speedIndex,
      lastEvoTime: null,
      diedOut: $diedOut
    });
  }

  function stopEvolution() {
    setState({
      figure: $figure,
      genId: $genId,
      step: $step,
      width: $width,
      height: $height,
      pixelOffX: $pixelOffX,
      pixelOffY: $pixelOffY,
      cellSize: $cellSize,
      showGrid: $showGrid,
      autoevolve: false,
      period: $period,
      firstPeriodStep: $firstPeriodStep,
      history: $history,
      speedIndex: $speedIndex,
      lastEvoTime: null,
      diedOut: $diedOut
    });
  }

  function pairEqual(a, b) {
    return (a[0] === b[0]) && (a[1] === b[1])
  }

  function indexOf(el, arr) {
    var idx = -1;
    for (var i = 0; i < arr.length; i++) {
      if (pairEqual(arr[i], el)) {
        idx = i;
        break;
      }
    }
    return idx
  }

  function inArray(el, arr) {
    return indexOf(el, arr) > -1
  }

  function toggleCell(x, y) {
    if (wantsToStopEvolution("Evolution is in progress. Do you want to stop it?")) {
      var newFigure = $figure;
      var newPoint = [x, y];
      var idx = indexOf(newPoint, newFigure);
      if (idx > -1)
        newFigure.splice(idx, 1);
      else
        newFigure.push(newPoint);

      setState({
        figure: newFigure,
        genId: newFigure.length > 2 ? generateNewId() : null,
        step: 0,
        width: $width,
        height: $height,
        pixelOffX: $pixelOffX,
        pixelOffY: $pixelOffY,
        cellSize: $cellSize,
        showGrid: $showGrid,
        autoevolve: false,
        period: 0,
        firstPeriodStep: null,
        history: [newFigure],
        speedIndex: $speedIndex,
        lastEvoTime: null,
        diedOut: false
      });
    }
  }

  var fps = 60,
      framesThisSecond = 0,
      lastFpsUpdate = 0;

  function mainLoop(timestamp) {

    if (timestamp > lastFpsUpdate + 1000) { // update every second
      fps = 0.25 * framesThisSecond + (1 - 0.25) * fps; // compute the new FPS

      lastFpsUpdate = timestamp;
      framesThisSecond = 0;
    }
    framesThisSecond++;

    update();
    render();

    // Request to do this again ASAP
    requestAnimationFrame(mainLoop);
  }

  // Cross-browser support for requestAnimationFrame
  var w = window;
  requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

  fillInPatternList();

  resetState();
  detectPatternFromHash();
  requestAnimationFrame(mainLoop);

});

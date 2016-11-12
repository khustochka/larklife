$(document).ready(function () {

  var $canvas = document.getElementById("lc");

  // State
  var $figure = [],
      $step = 0,
      $pixelOffX = -1,
      $pixelOffY = -1,
      $cellSize = 18,
      $showGrid = true;


  var $radius,
      $timer,
      $history = [],
      $oscillating = false,
      historyDepth = 15;

  var speedOptions = [0.01, 0.05, 0.1, 0.5, 1],
      $speedIndex = 2;

  var isDragging = false, isMouseDown = false, dragX, dragY, touchMoveStart = null;

  window.addEventListener('resize', resizeCanvas, false);
  window.addEventListener('orientationchange', resizeCanvas, false);

  setTimeout(initialLoad, 100); // Need some delay because the grid was not showing up.
  showSpeed();

  function resizeCanvas() {
    $canvas.width = window.innerWidth;
    $canvas.height = window.innerHeight;
    redrawState();
  }

  function redrawState() {
    // Find canvas
    var ctx = $canvas.getContext("2d");
    var canvasWidth = $canvas.width,
        canvasHeight = $canvas.height;

    var radiusDiff = 1;

    $radius = ($cellSize - radiusDiff) / 2;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw grid
    if (doShowGrid()) {
      var offRemainderX = $pixelOffX % $cellSize,
          offRemainderY = $pixelOffY % $cellSize;

      ctx.beginPath();
      ctx.strokeStyle = 'lightblue';
      ctx.lineWidth = 1;
      for (var rx = 0.5 + offRemainderX; rx < canvasWidth; rx = rx + $cellSize) {
        ctx.moveTo(rx, 0);
        ctx.lineTo(rx, canvasHeight);
      }
      for (var ry = 0.5 + offRemainderY; ry < canvasHeight; ry = ry + $cellSize) {
        ctx.moveTo(0, ry);
        ctx.lineTo(canvasWidth, ry);
      }
      ctx.stroke();
    }

    // Draw points
    var point,
        visibleMin = pixelToCellCoords(0, 0),
        visibleMax = pixelToCellCoords(canvasWidth - 1, canvasHeight - 1);

    for (var i = 0; i < $figure.length; i++) {
      point = $figure[i];
      var x = Math.floor(point[0]), y = Math.floor(point[1]);
      if (x >= visibleMin.x && x <= visibleMax.x && y >= visibleMin.y && y <= visibleMax.y) {
        drawPoint(ctx, x, y);
        //console.log(x + " ; " + y);
      }
    }

    // Show step and size
    $(".stepNum").html($step);
    $(".sizeNum").html($figure.length);
  }

  function processCanvasClick(pixelX, pixelY) {
    // Ignore if clicked on border
    if (clickInCell(pixelX, pixelY)) {
      // If evolution is running stop it
      var autoGo = !!$timer;
      // Ask user if he wants to override the current evolution
      if (autoGo) {
        processStop();
        if (window.confirm("Evolution is in progress. Do you really want to intervene?")) {
          // Do nothing if customer agrees
        }
        else {
          // Restart evolution if it was running
          if (autoGo) performGo();
          return false; // Exit
        }
      }
      toggleCell(pixelX, pixelY)
    }
  }

  function toggleCell(pixelX, pixelY) {
    var cellCoords = pixelToCellCoords(pixelX, pixelY);
    var x = cellCoords.x,
        y = cellCoords.y;
    var newPoint = [x, y];
    var idx = indexOf(newPoint, $figure);
    if (idx > -1)
      $figure.splice(idx, 1);
    else
      $figure.push(newPoint);
    // Adding or removing a cell resets the step counter and history
    resetEvolutionState();
    redrawState();
  }

  function resetEvolutionState() {
    $step = 0;
    $history = [];
    $oscillating = false;
    dropNotice();
  }

  function pairEqual(a, b) {
    return (a[0] == b[0]) && (a[1] == b[1])
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

  function pixelToCellCoords(pixelX, pixelY) {
    return {
      x: Math.floor((pixelX - $pixelOffX) / $cellSize),
      y: Math.floor((pixelY - $pixelOffY) / $cellSize)
    }
  }

  function clickInCell(pixelX, pixelY) {
    // Check that click is not on the grid, but only if the grid is shown
    return !(doShowGrid() && (pixelX - $pixelOffX) % $cellSize == 0 || (pixelY - $pixelOffY) % $cellSize == 0)
  }

  function doShowGrid() {
    return $showGrid && $cellSize >= 7
  }


  function drawPoint(ctx, x, y) {
    var radiusDiff = 1;
    ctx.fillStyle = "#336633";
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
      ctx.fillStyle = "#336633";
      ctx.fillRect(topX, topY, $cellSize, $cellSize);
    }
  }

  $($canvas).on("mousedown", function (e) {
    if (e.which === 1) { // Ignore right button
      e.preventDefault();
      dragX = e.clientX;
      dragY = e.clientY;
      $("body").css("cursor", "move");
      isMouseDown = true;
      $(document).on("mousemove", dragTheGrid);
    }
  });

  $(document).on("mouseup", function (e) {
    e.preventDefault();
    $(document).off("mousemove");
    $("body").css("cursor", "default");
    if (isDragging) {
    }
    else {
      if (isMouseDown && e.which === 1) processClick(e);
    }
    isMouseDown = false;
    isDragging = false;
  });

  $("button#plusSize").click(zoomIn);

  $("button#minusSize").click(zoomOut);

  $("#stepBtn").click(processStep);

  $("#goBtn").click(processGo);

  $("#stopBtn").click(processStop);

  $("button#clearBtn").click(function () {
    clearAndLoad([]);
  });

  function zoomIn() {
    var result = $cellSize * 1.6;
    setNewScale(result);
  }

  function zoomOut() {
    var result = $cellSize / 1.6;
    setNewScale(result);
  }

  function setNewScale(newCellSize) {
    calcNewScale(newCellSize);
    redrawState();
  }

  function calcNewScale(newCellSize) {
    var newFutureCellSize = newCellSize;
    if (newFutureCellSize >= 1) newFutureCellSize = Math.round(newFutureCellSize);
    var scale = newFutureCellSize / $cellSize;
    $pixelOffX = ($canvas.width / 2) * (1 - scale) + (scale * $pixelOffX);
    $pixelOffY = ($canvas.height / 2) * (1 - scale) + (scale * $pixelOffY);
    $cellSize = newFutureCellSize;
  }

  function dragTheGrid(e) {
    if (isMouseDown) {
      e.preventDefault();
      isDragging = true;
      var newX = e.clientX, newY = e.clientY;
      $pixelOffX = $pixelOffX + newX - dragX;
      $pixelOffY = $pixelOffY + newY - dragY;
      redrawState();
      dragX = newX;
      dragY = newY;
    }
  }

  $($canvas).on("touchstart", function (e) {
    //e.preventDefault();
    touchMoveStart = [e.originalEvent.touches[0].pageX, e.originalEvent.touches[0].pageY];
  });

  $($canvas).on("touchend", function (e) {
    //e.preventDefault();
    touchMoveStart = null;
  });

  $(document).on("touchmove", function (e) {
    e.preventDefault();
    if (touchMoveStart) {
      $pixelOffX += e.originalEvent.touches[0].pageX - touchMoveStart[0];
      $pixelOffY += e.originalEvent.touches[0].pageY - touchMoveStart[1];
      touchMoveStart = [e.originalEvent.touches[0].pageX, e.originalEvent.touches[0].pageY];
      redrawState();
    }
  });

  function processClick(e) {
    var x = e.clientX, y = e.clientY,
        pixelX = x - $canvas.offsetLeft - 1,
        pixelY = y - $canvas.offsetTop - 1;
    if (pixelX >= 0 && pixelX <= $canvas.width &&
        pixelY >= 0 && pixelY <= $canvas.height) {
      processCanvasClick(pixelX, pixelY);
    }
  }

  function processStep() {
    if (!$timer) performStep();
  }

  // Returns true if progress goes on, false if stopped
  function performStep() {
    // If config is empty initially, just ignore.
    if ($figure.length == 0) return false;
    convertFigure();
    var period = $oscillating ? false : figureInHistory();
    if (period == 1) {
      showNotice("The population has stabilized on step " + $step + ".");
      return false;
    }
    else $step++;
    if (period) {
      showNotice("The population is oscillating with period " + period + " (step " + $step + " = step " + ($step - period) + ").");
      $oscillating = true;
      $history = [];
      //return false;
    }
    if ($("#autoFit").is(":checked")) fitToScreenCalculations();
    redrawState();
    // If it has become empty.
    if ($figure.length == 0) {
      showNotice("The population died out on step " + $step + ".");
      return false;
    }
    else return true;
  }

  function convertFigure() {

    if (!$oscillating) pushToHistory($figure);

    var newFigure = [], neighbours = {}, x, y, pnt, xpnt;

    for (var i = 0; i < $figure.length; i++) {
      x = $figure[i][0];
      y = $figure[i][1];
      insertNeighbour(neighbours, x - 1, y - 1);
      insertNeighbour(neighbours, x - 1, y);
      insertNeighbour(neighbours, x - 1, y + 1);
      insertNeighbour(neighbours, x, y - 1);
      insertNeighbour(neighbours, x, y + 1);
      insertNeighbour(neighbours, x + 1, y - 1);
      insertNeighbour(neighbours, x + 1, y);
      insertNeighbour(neighbours, x + 1, y + 1);
    }
    for (var key in neighbours) {
      xpnt = key.split(",");
      pnt = [parseInt(xpnt[0]), parseInt(xpnt[1])];
      if (neighbours[pnt] == 3 || (neighbours[pnt] == 2 && inArray(pnt, $figure))) newFigure.push(pnt);
    }
    $figure = newFigure;
  }

  function insertNeighbour(neighbours, a, b) {
    if (neighbours[[a, b]]) {
      neighbours[[a, b]] = neighbours[[a, b]] + 1
    }
    else neighbours[[a, b]] = 1;
  }

  function pushToHistory(figure) {
    $history.push(figure);
    $history.splice(0, $history.length - historyDepth);
  }

  function figureInHistory() {
    var historicStep, result;
    for (var h = $history.length - 1; h >= 0; h--) {
      historicStep = $history[h];
      if ($figure.length != historicStep.length) continue;
      result = true;
      for (var i = 0; i < $figure.length; i++) {
        if (!inArray($figure[i], historicStep)) {
          result = false;
          break
        }
      }
      if (result) {
        return $history.length - h;
      }
    }
    return false;
  }

  function processGo() {
    if (!$timer) {
      performGo();
    }
  }

  function performGo() {
    var result = performStep();
    if (result) $timer = window.setTimeout(performGo, speedOptions[$speedIndex] * 1000);
    else processStop();
  }

  function processStop() {
    if ($timer) {
      window.clearTimeout($timer);
    }
    $timer = 0;
  }

  function clearAndLoad(newFigure) {
    // If evolution is running stop it
    var autoGo = !!$timer;
    if (autoGo) {
      processStop();
      if (window.confirm("Evolution is in progress. Do you really want to clear the field?")) {
      }
      else {
        // Restart evolution if it was running
        if (autoGo) performGo();
        return false;
      }
    }
    resetEvolutionState();
    $pixelOffX = $pixelOffX % $cellSize;
    $pixelOffY = $pixelOffY % $cellSize;
    $figure = newFigure;
    redrawState();
  }

  function showNotice(text) {
    var notice = $(".notice");
    notice.html(text);
    notice.show();
    notice.css("left", ($canvas.width - notice.width()) / 2 + "px");
  }

  function dropNotice() {
    var notice = $(".notice");
    notice.html("");
    notice.hide();
  }

  $("#btnFaster").click(function () {
    $speedIndex = Math.max($speedIndex - 1, 0);
    showSpeed();
  });

  $("#btnSlower").click(function () {
    $speedIndex = Math.min($speedIndex + 1, speedOptions.length - 1);
    showSpeed();
  });

  function showSpeed() {
    $(".showSpeed").html(speedOptions[$speedIndex] + "s");
  }

  var scrollData = {delta: 0, timestamp: null};

  function sign(x) {
    return x > 0 ? 1 : x < 0 ? -1 : 0;
  }

  $(document).on("wheel", function (e) {
    console.log(scrollData);
    var delta = e.originalEvent.deltaY, timestamp = e.originalEvent.timeStamp;

    if (delta == 0) {
      scrollData = {delta: 0, timestamp: null};
      return true;
    }

    if (scrollData.timestamp == null || (timestamp - scrollData.timestamp) > 1000 || sign(scrollData.delta) != sign(delta)) {
      scrollData = {delta: delta, timestamp: timestamp};
      return true;
    }
    else {
      scrollData.delta += delta;
    }

    if ((timestamp - scrollData.timestamp) > 70 && Math.abs(scrollData.delta) > 3) {
      if (delta > 3)
        zoomOut();
      else if (delta < -3)
        zoomIn();
      scrollData = {delta: 0, timestamp: null};
    }
  });

  $("#btnFit").click(function () {
    if (fitToScreenCalculations()) redrawState();
  });

  function fitToScreenCalculations(forceAutoCenter) {
    if ($figure.length == 0) return false;

    var result = false;

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
        newRel = Math.min($canvas.width / pixelWidth, $canvas.height / pixelHeight);

    var screenMinX = Math.floor(-$pixelOffX / $cellSize),
        screenMinY = Math.floor(-$pixelOffY / $cellSize),
        screenMaxX = Math.floor(($canvas.width - $pixelOffX) / $cellSize),
        screenMaxY = Math.floor(($canvas.height - $pixelOffY) / $cellSize);

    if (forceAutoCenter || minX < screenMinX || minY < screenMinY || maxX > screenMaxX || maxY > screenMaxY) {
      var oldPixelX = $pixelOffX,
          oldPixelY = $pixelOffY,
          newPixelOffX = Math.round(($canvas.width - pixelWidth) / 2 - minX * $cellSize),
          newPixelOffY = Math.round(($canvas.height - pixelHeight) / 2 - minY * $cellSize),
          diffX = (newPixelOffX - $pixelOffX) / 30,
          diffY = (newPixelOffY - $pixelOffY) / 30;
      // var j = 1;
      // var smoothCenter = function () {
      //   $pixelOffX = oldPixelX + Math.floor(diffX * j);
      //   $pixelOffY = oldPixelY + Math.floor(diffY * j);
      //   j++;
      //   if (j < 30) setTimeout(smoothCenter, 1000 / 120);
      // };
      // smoothCenter();
      // FIXME: rethink smooth center
      $pixelOffX = newPixelOffX;
      $pixelOffY = newPixelOffY;
      result = true;
    }

    if (newRel < 1) {
      calcNewScale(Math.floor($cellSize * newRel));
      result = true;
    }
    return result;

  }

  var PATTERNS = {
    glider: [[2, 1], [3, 2], [1, 3], [2, 3], [3, 3]],
    glidergun: [[5,6],[6,6],[6,7],[5,7],[15,6],[15,7],[15,8],[16,5],[17,4],[18,4],[16,9],[17,10],[18,10],[19,7],[21,6],[21,7],[21,8],[20,5],[20,9],[22,7],[25,6],[26,6],[25,5],[26,5],[25,4],[26,4],[27,3],[27,7],[29,7],[29,8],[29,3],[29,2],[39,4],[40,4],[40,5],[39,5]]
  };

  function loadPattern(name) {
    if (PATTERNS[name]) {
      resetEvolutionState();
      $figure = PATTERNS[name];
      fitToScreenCalculations(true);
      redrawState();
    }
  }

  function initialLoad() {
    resizeCanvas();
    if (window.location.hash) {
      var hash = window.location.hash.substring(2); //Puts hash in variable, and removes the # character
      if (hash)
        loadPattern(hash);
    }
  }

  $("#btnPrint").click(function() {
    console.log(JSON.stringify($figure));
  });
});

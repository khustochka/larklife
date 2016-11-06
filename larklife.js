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
      $history = null;

  var speedOptions = [0.001, 0.01, 0.05, 0.1, 0.5, 1],
      $speedIndex = 3;

  var isDragging = false, isMouseDown = false, dragX, dragY;

  var glider = [[2, 1], [3, 2], [1, 3], [2, 3], [3, 3]];

  window.addEventListener('resize', resizeCanvas, false);

  resizeCanvas();
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

    $radius = ($cellSize - 1) / 2;

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
      // Ask user if he wants to override the current evolution
      if ($step > 0 && $figure.length > 0) {
        // If evolution is running stop it
        var autoGo = !!$timer;
        if (autoGo) processStop();
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
    $history = null;
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
    var canvasCenterX = (x * $cellSize) + $pixelOffX + $radius + 1,
        canvasCenterY = (y * $cellSize) + $pixelOffY + $radius + 1;
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.arc(canvasCenterX, canvasCenterY, $radius, 0, 2 * Math.PI);
    ctx.fill();
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

  $("button#plusSize").click(function () {
    setNewScale(Math.round($cellSize * 1.6));
  });

  $("button#minusSize").click(function () {
    var result = Math.round($cellSize / 1.6);
    setNewScale(result);
  });

  $("#stepBtn").click(processStep);

  $("#goBtn").click(processGo);

  $("#stopBtn").click(processStop);

  $("button#clearBtn").click(function () {
    clearAndLoad([]);
  });

  function setNewScale(newCellSize) {
    var scale = newCellSize / $cellSize;
    $pixelOffX = ($canvas.width / 2) * (1 - scale) + (scale * $pixelOffX);
    $pixelOffY = ($canvas.height / 2) * (1 - scale) + (scale * $pixelOffY);
    $cellSize = newCellSize;
    redrawState();
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
    $step++;
    redrawState();
    // If it has become empty.
    if ($figure.length == 0) {
      showNotice("The population died out on step " + $step + ".");
      return false
    }
    else return true;
  }

  function convertFigure() {

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

  function processGo() {
    if (!$timer){
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

});

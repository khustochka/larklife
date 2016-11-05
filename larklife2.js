$(document).ready(function () {

  var $canvas = document.getElementById("lc");

  // State
  var $figure = [],
      $step = 0,
      $pixelOffX = -1,
      $pixelOffY = -1,
      $cellSize = 18;


  var $radius,
      borderWidth = parseInt($($canvas).css("border-width"));

  var isDragging = false, dragX, dragY;

  window.addEventListener('resize', resizeCanvas, false);

  resizeCanvas();

  function resizeCanvas() {
    $canvas.width = window.innerWidth;
    $canvas.height = window.innerHeight * 0.7;

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

    // Show step
    $(".stepNum").html($step);
  }

  function processCanvasClick(pixelX, pixelY) {
    // Ignore if clicked on border
    if (clickInCell(pixelX, pixelY)) {
      var cellCoords = pixelToCellCoords(pixelX, pixelY);
      var x = cellCoords.x,
          y = cellCoords.y;
      var newPoint = [x, y];
      var idx = indexOf(newPoint, $figure);
      if (idx > -1)
        $figure.splice(idx, 1);
      else
        $figure.push(newPoint);
      redrawState();
    }
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

  function pixelToCellCoords(pixelX, pixelY) {
    return {
      x: Math.floor((pixelX - $pixelOffX) / $cellSize),
      y: Math.floor((pixelY - $pixelOffY) / $cellSize)
    }
  }

  function clickInCell(pixelX, pixelY) {
    return !((pixelX - $pixelOffX) % $cellSize == 0 || (pixelY - $pixelOffY) % $cellSize == 0)
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
    e.preventDefault();
    dragX = e.clientX;
    dragY = e.clientY;
    $("body").css("cursor", "move");
    $(document).on("mousemove", dragTheGrid);
  });

  $(document).on("mouseup", function (e) {
    $(document).off("mousemove");
    $("body").css("cursor", "default");
    if (isDragging) {
    }
    else {
      processClick(e);
    }
    isDragging = false;
  });

  $("button#plusSize").click(function () {
    setNewScale(Math.round($cellSize * 1.6));
  });

  $("button#minusSize").click(function () {
    var result = Math.max(7, Math.round($cellSize / 1.6));
    setNewScale(result);
  });

  $("button#clearBtn").click(function () {
    $figure = [];
    $step = 0;
    $pixelOffX = $pixelOffX % $cellSize;
    $pixelOffY = $pixelOffY % $cellSize;
    redrawState();
  });

  function setNewScale(newCellSize) {
    var scale = newCellSize / $cellSize;
    $pixelOffX = ($canvas.width / 2) * (1 - scale) + (scale * $pixelOffX);
    $pixelOffY = ($canvas.height / 2) * (1 - scale) + (scale * $pixelOffY);
    $cellSize = newCellSize;
    redrawState();
  }

  function dragTheGrid(e) {
    e.preventDefault();
    isDragging = true;
    var newX = e.clientX, newY = e.clientY;
    $pixelOffX = $pixelOffX + newX - dragX;
    $pixelOffY = $pixelOffY + newY - dragY;
    redrawState();
    dragX = newX;
    dragY = newY;
  }

  function processClick(e) {
    var x = e.clientX, y = e.clientY,
        pixelX = x - $canvas.offsetLeft - 1 - borderWidth,
        pixelY = y - $canvas.offsetTop - 1 - borderWidth;
    if (pixelX >= 0 && pixelX <= $canvas.width &&
        pixelY >= 0 && pixelY <= $canvas.height) {
      processCanvasClick(pixelX, pixelY);
    }
  }

});

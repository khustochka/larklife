$( document ).ready(function() {

  var $canvas = document.getElementById("lc");

  // State
  var $figure = [[0, 0]],
      $step = 0,
      $pixelOffX = 0,
      $pixelOffY = 0,
      $cellSize = 18;

  var $radius;

  var isMouseDown = false, dragX, dragY;

  redrawState();

  function redrawState() {
    // Find canvas
    var ctx = $canvas.getContext("2d");
    var canvasWidth = $canvas.width,
        canvasHeight = $canvas.height;

    $radius = Math.floor(($cellSize - 1) / 2) - 0.5;

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
        visibleMinX = Math.floor(-$pixelOffX / $cellSize),
        visibleMinY = Math.floor(-$pixelOffY / $cellSize),
        visibleMaxX = Math.floor((canvasWidth - 1 - $pixelOffX) / $cellSize),
        visibleMaxY = Math.floor((canvasHeight - 1 - $pixelOffY) / $cellSize)
        ;

    for (var i = 0; i < $figure.length; i++) {
      point = $figure[i];
      var x = point[0], y = point[1];
      if (x >= visibleMinX && x <= visibleMaxX && y >= visibleMinY && y <= visibleMaxY) {
        drawPoint(ctx, x, y);
        console.log(x + " ; " + y);
      }
    }

    // Show step
    $(".stepNum").html($step);
  }

  function drawPoint(ctx, x, y) {
    var canvasCenterX = (x * $cellSize) + $pixelOffX + $radius + 1.5,
        canvasCenterY = (y * $cellSize) + $pixelOffY + $radius + 1.5;
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.arc(canvasCenterX, canvasCenterY, $radius, 0, 2*Math.PI);
    ctx.fill();
  }

  $($canvas).on("mousedown", function(e) {
    isMouseDown = true;
    dragX = e.clientX;
    dragY = e.clientY;
    $("body").css("cursor", "move");
    $(document).on("mousemove", dragTheGrid);
  });

  $(document).on("mouseup", function() {
    if (isMouseDown) {
      $(document).off("mousemove");
      $("body").css("cursor", "default");
      isMouseDown = false;
    }
  });

  $("button#plusSize").click(function() {
    $cellSize = Math.round($cellSize * 1.6);
    redrawState();
  });

  $("button#minusSize").click(function() {
    var result = Math.round($cellSize / 1.6);
    if (result < 7) $cellSize = 7;
    else $cellSize = result;
    redrawState();
  });

  function dragTheGrid(e) {
    var newX = e.clientX, newY = e.clientY;
    $pixelOffX = $pixelOffX + newX - dragX;
    $pixelOffY = $pixelOffY + newY - dragY;
    redrawState();
    dragX = newX;
    dragY = newY;
  }
  
});

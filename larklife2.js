$( document ).ready(function() {

  var $canvas = document.getElementById("lc");

  // State
  var $figure = [[0, 0]],
      $step = 0,
      $pixelOffX = 0,
      $pixelOffY = 0,
      $cellSize = 18;

  var isMouseDown = false, dragX, dragY;

  redrawState();

  function redrawState() {
    // Find canvas
    var ctx = $canvas.getContext("2d");
    var canvasWidth = $canvas.width,
        canvasHeight = $canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw grid

    // Cicle through canvas pixels

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

    // Show step
    $(".stepNum").html($step);
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

  function dragTheGrid(e) {
    var newX = e.clientX, newY = e.clientY;
    $pixelOffX = $pixelOffX + newX - dragX;
    $pixelOffY = $pixelOffY + newY - dragY;
    redrawState();
    dragX = newX;
    dragY = newY;
  }
  
});
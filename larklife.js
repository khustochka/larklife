$( document ).ready(function() {

  var canvas = document.getElementById("lc");
  var ctx = canvas.getContext("2d");
  var width = 700, height = 300, cellSize = 15, radius = (cellSize - 1) / 2;
  var
      canvasLeft = canvas.offsetLeft,
      canvasTop = canvas.offsetTop;

  function drawGrid() {
    ctx.strokeStyle = 'lightblue';
    ctx.lineWidth = 1;
    for (var i = 0.5; i < width; i = i + cellSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0.5);
      ctx.lineTo(i, height + 0.5);
      ctx.stroke();
    }
    for (var j = 0.5; j < height; j = j + cellSize) {
      ctx.beginPath();
      ctx.moveTo(0.5, j);
      ctx.lineTo(width + 0.5, j);
      ctx.stroke();
    }
  }

  function drawPoint(x, y) {
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.arc(conv(x), conv(y), radius - 0.5, 0, 2*Math.PI);
    ctx.fill();
  }

  function clearPoint(x, y) {
    ctx.fillStyle = "white";
    ctx.beginPath();
    var ux = conv2(x), uy = conv2(y);
    ctx.rect(ux, uy, radius * 2, radius * 2);
    ctx.fill();
  }

  function togglePoint(x, y) {
    var p = ctx.getImageData(conv(x), conv(y), 1, 1).data;
    if (p[1] == 0) drawPoint(x, y);
    else clearPoint(x, y);
  }

  function conv(x) {
    return x * cellSize + radius + 0.5;
  }

  function conv2(x) {
    return x * cellSize + 0.5;
  }

  function unconv(x) {
    return Math.floor(x / cellSize);
  }

  function onBorder(x) {
    return (x % cellSize == 0);
  }

  function processClick(event) {
    var x = event.pageX - canvasLeft,
        y = event.pageY - canvasTop;

    if (onBorder(x) || onBorder(y)) return false;
    else togglePoint(unconv(x), unconv(y));
  }

  drawGrid();

  canvas.addEventListener('click', processClick, false);

  //drawPoint(0, 0);
  //drawPoint(2, 3);
  //clearPoint(2, 3);




});

$( document ).ready(function() {

  var canvas = document.getElementById("lc");
  var ctx = canvas.getContext("2d");
  var width = 700, height = 300, cellSize = 15, radius = (cellSize - 1) / 2;
  var
      canvasLeft = canvas.offsetLeft,
      canvasTop = canvas.offsetTop;
  var $figure = [];

  function drawGrid() {
    ctx.beginPath();
    ctx.strokeStyle = 'lightblue';
    ctx.lineWidth = 1;
    for (var i = 0.5; i < width; i = i + cellSize) {
      ctx.moveTo(i, 0.5);
      ctx.lineTo(i, height + 0.5);
    }
    for (var j = 0.5; j < height; j = j + cellSize) {
      ctx.moveTo(0.5, j);
      ctx.lineTo(width + 0.5, j);
    }
    ctx.stroke();
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
    if (isFilled(x, y)) clearPoint(x, y);
    else drawPoint(x, y);
  }

  function isFilled(x, y) {
    var p = ctx.getImageData(conv(x), conv(y), 1, 1).data;
    return p[1] == 128;
  }

  function conv(x) {
    return x * cellSize + radius + 1;
  }

  function conv2(x) {
    return x * cellSize + 1;
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

  $("#stepBtn").click(processStep);

  function processStep() {
    var figure = readFigure();
    var newfigure = convertFigure(figure);
    redrawFigure(newfigure);
  }

  function readFigure() {
    var result = [];
    for (var i = 0; i < width / cellSize; i++) {
      for (var j = 0; j < height / cellSize; j++) {
        if (isFilled(i, j)) { result.push([i, j]) }
      }
    }
    return result;
  }

  function convertFigure(figure) {

    var newFigure = [], neighbours = {}, x, y, pnt, xpnt;

    function insertNeighbour(a, b) {
      if (neighbours[[a, b]]) {neighbours[[a, b]] = neighbours[[a, b]] + 1}
      else neighbours[[a, b]] = 1;
    }
    function inArray(el, arr) {
      for (var i = 0; i < arr.length; i++) {
        if (el[0] == arr[i][0] && el[1] == arr[i][1]) return true;
      }
      return false;
    }

    for (var i = 0; i < figure.length; i ++) {
      x = figure[i][0];
      y = figure[i][1];
      insertNeighbour(x - 1, y - 1);
      insertNeighbour(x - 1, y);
      insertNeighbour(x - 1, y + 1);
      insertNeighbour(x, y - 1);
      insertNeighbour(x, y + 1);
      insertNeighbour(x + 1, y - 1);
      insertNeighbour(x + 1, y);
      insertNeighbour(x + 1, y + 1);
    }
    for (var key in neighbours) {
      xpnt = key.split(",");
      pnt = [parseInt(xpnt[0]), parseInt(xpnt[1])];
      if (neighbours[pnt] == 3 || (neighbours[pnt] == 2 && inArray(pnt, figure))) newFigure.push(pnt);
    }
    return newFigure;
  }

  function redrawFigure(figure) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    for (var i = 0; i < figure.length; i ++) {
      drawPoint(figure[i][0], figure[i][1]);
    }
  }

});

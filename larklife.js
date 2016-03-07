$( document ).ready(function() {

  var canvas = document.getElementById("lc");
  var ctx = canvas.getContext("2d");
  var width = 700, height = 300, cellSize = 18, radius = (cellSize - 1) / 2;
  var
      canvasLeft = canvas.offsetLeft,
      canvasTop = canvas.offsetTop;
  var $figure = [], timer = 0;

  function drawGrid() {
    ctx.beginPath();
    ctx.strokeStyle = 'lightblue';
    ctx.lineWidth = 1;
    for (var i = 0.5; i < width; i = i + cellSize) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
    }
    for (var j = 0.5; j < height; j = j + cellSize) {
      ctx.moveTo(0, j);
      ctx.lineTo(width, j);
    }
    ctx.stroke();
  }

  function drawPoint(x, y) {
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.arc(conv(x), conv(y), radius - 1.5, 0, 2*Math.PI);
    ctx.fill();
  }

  function clearPoint(x, y) {
    var ux = conv2(x), uy = conv2(y);
    ctx.clearRect(ux, uy, radius * 2, radius * 2);
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
    return Math.floor((x - 2) / cellSize);
  }

  function processClick(event) {
    var x = event.pageX - canvasLeft,
        y = event.pageY - canvasTop;
    console.log("x: " + x + ", y: " + y);
    togglePoint(unconv(x), unconv(y));
  }

  drawGrid();

  canvas.addEventListener('click', processClick, false);

  $("#stepBtn").click(processStep);

  $("#goBtn").click(processGo);

  $("#stopBtn").click(processStop);

  $("#clearBtn").click(clearField);

  function processStep() {
    var figure = readFigure();
    var newfigure = convertFigure(figure);
    redrawFigure(newfigure);
  }

  function processGo() {
    var figure = readFigure();
    if (figure.length > 0) {
      var newfigure = convertFigure(figure);
      redrawFigure(newfigure);
      timer = window.setTimeout(processGo, 50);
    }
    else timer = 0;
  }

  function processStop() {
    if (timer) {
      window.clearTimeout(timer);
      timer = 0;
    }
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
    clearField();
    for (var i = 0; i < figure.length; i ++) {
      drawPoint(figure[i][0], figure[i][1]);
    }
  }

  function clearField() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
  }

});

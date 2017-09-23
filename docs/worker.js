self.addEventListener('message', function (e) {
  var genId = e.data.genId,
      figure = e.data.figure,
      newFigure = evolve(figure);
  self.postMessage({genId: genId, figure: newFigure});
}, false);

function evolve(figure) {

  function insertNeighbour(neighbours, a, b) {
    if (neighbours[[a, b]]) {
      neighbours[[a, b]] = neighbours[[a, b]] + 1
    }
    else neighbours[[a, b]] = 1;
  }

  if (figure.length < 3) return ([]);

  var newFigure = [], neighbours = {}, x, y, pnt, xpnt;

  for (var i = 0; i < figure.length; i++) {
    x = figure[i][0];
    y = figure[i][1];
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
    if (neighbours[pnt] === 3 || (neighbours[pnt] === 2 && inArray(pnt, figure))) newFigure.push(pnt);
  }

  return newFigure;

}

function pairEqual(a, b) {
  return (a[0] === b[0]) && (a[1] === b[1])
}

function inArray(el, arr) {
  return indexOf(el, arr) > -1
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

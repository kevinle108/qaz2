var times = 2;

function createBallotPdf(ballot) {
  let canvases = document.getElementById("canvases")
  if (document.body.contains(canvases)) {
    canvases.innerHTML = ''
  } else {
    document.body.insertAdjacentHTML("beforeend", `<div id="canvases" style="display:none"></div>`)
    canvases = document.getElementById("canvases")
  }

  const pdf = new jsPDF('p', 'px', 'letter')
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const html = '<canvas id="CANVAS_ID" width="' + (850 * times) + '" height="' + (1100 * times) + '" style="border:1px solid black; display:block;"></canvas>'

  ballot.pages.forEach((page, index) => {
    let canvasId = 'canvas' + index
    canvases.insertAdjacentHTML("beforeend", html.replace("CANVAS_ID", canvasId))
    let canvas = document.getElementById(canvasId)
    drawPage(canvas, ballot, index)
    if (index > 0) {
      pdf.addPage()
    }
    let imgData = canvas.toDataURL("image/jpeg", 1.0);
    pdf.addImage(imgData, 'JPG', 0, 0, pdfWidth, pdfHeight);
  })

  pdf.save("ballot.pdf");
}

function drawPage(canvas, ballot, index) {
  let ctx = canvas.getContext('2d');
  ctx.drawFilledRect(0, 0, canvas.width, canvas.height, 'white')

  var rectangles = ballot.pages[index].rectangles;
  for (i = 0; i < rectangles.length; i++) {
    var rectangle = rectangles[i];
    if (rectangle.width == 0) {
      ctx.drawFilledRect(rectangle.x, rectangle.y, rectangle.dx, rectangle.dy, rectangle.fillStyle);
    } else {
      ctx.drawRect(rectangle.x, rectangle.y, rectangle.dx, rectangle.dy, rectangle.width);
    }
  }

  ctx.fillStyle = "black";
  ctx.strokeStyle = "black";
  var lines = ballot.pages[index].lines;
  for (i = 0; i < lines.length; i++) {
    var line = lines[i];
    ctx.drawLine(line.x1, line.y1, line.x2, line.y2, line.width)
  }

  var texts = ballot.pages[index].textLines;
  for (i = 0; i < texts.length; i++) {
    var text = texts[i];
    ctx.drawTextLine(text.txt, text.x, text.y, text.font, text.align)
  }

  var textAreas = ballot.pages[index].textAreas;
  console.log('number of textAreas = ' + textAreas.length)
  for (i = 0; i < textAreas.length; i++) {
    var text = textAreas[i];
    ctx.drawTextArea(text.txt, text.x, text.y, text.width, text.lineHeight, text.font)
  }

  drawOvals(ctx, ballot, index);
}

function drawOvals(ctx, ballot, index) {
  var selected = 0;
  for (i = 0; i < ballot.contests.length; i++) {
    if (ballot.contests[i].pageIndex == index) {
      var candidates = ballot.contests[i].candidates;
      for (j = 0; j < candidates.length; j++) {
        var candidate = candidates[j];
        selected = candidate.selected;
        var ovals = candidate.ovals;
        for (k = 0; k < ovals.length; k++) {
          ctx.drawOval(ovals[k].x, ovals[k].y, false);
        }
        if (selected > 0) {
          ctx.drawOval(ovals[selected - 1].x, ovals[selected - 1].y, true);
          if (typeof candidate.nameRectangle != 'undefined') {
            ctx.drawTextArea(candidate.candidateName, candidate.nameRectangle.x + 96, candidate.nameRectangle.y + 31, candidate.nameRectangle.width - 96, 12, "11px Arial");
          }
        }
      }
    }
  }
}

CanvasRenderingContext2D.prototype.drawOval = function (x, y, filled) {
  const xRadius = 9.5
  const yRadius = 6.5
  this.beginPath()
  x += 40
  y += 30
  this.ellipse(x * times, y * times, xRadius * times, yRadius * times, 0, 0, Math.PI * 2)
  this.stroke()
  if (filled) this.fill()
}

CanvasRenderingContext2D.prototype.drawLine = function (x1, y1, x2, y2, lineWidth) {
  this.beginPath()
  this.lineWidth = lineWidth * times
  this.moveTo(x1 * times, y1 * times)
  this.lineTo(x2 * times, y2 * times)
  this.stroke()
}

CanvasRenderingContext2D.prototype.drawRect = function (x, y, dx, dy, lineWidth) {
  this.lineWidth = lineWidth * times
  this.strokeRect(x * times, y * times, dx * times, dy * times)
}

CanvasRenderingContext2D.prototype.drawFilledRect = function (x, y, dx, dy, fillStyle) {
  this.fillStyle = fillStyle
  this.fillRect(x * times, y * times, dx * times, dy * times)
  this.fillStyle = 'black' // reset the fillStyle back to black
}

CanvasRenderingContext2D.prototype.drawTextArea = function (text, x, y, dx, lineHeight, font = '') {

  if (font !== '') this.font = adjustFontSize(font)

  this.textAlign = 'left'
  this.textBaseline = 'top'
  x += 2
  x *= times
  y += 2
  y *= times
  dx -= 7
  dx *= times
  lineHeight *= times
  let lines = text.split('\\n')
  let lineIdx, wordIdx, txtToPrint, txtToTry, words, word
  for (lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    txtToPrint = ''
    if (lines[lineIdx] != '') {
      words = lines[lineIdx].split(' ')
      for (wordIdx = 0; wordIdx < words.length; wordIdx++) {
        word = words[wordIdx]
        if (txtToPrint === '') {
          txtToTry = word
        } else {
          txtToTry = txtToPrint + ' ' + word
        }
        if (this.measureText(txtToTry).width > dx) {
          this.fillText(txtToPrint, x, y)
          y += lineHeight
          txtToPrint = word
        } else {
          txtToPrint = txtToTry
        }
      }
    }
    if (lines[lineIdx] != '') {
      this.fillText(txtToPrint, x, y)
      y += lineHeight
    } else {
      y += 0.75 * lineHeight
    }
  }
}

CanvasRenderingContext2D.prototype.drawTextLine = function (txt, x, y, font = '', align = '') {
  if (font !== '') {
    this.font = adjustFontSize(font)
  }
  if (align !== '') this.textAlign = align
  this.textBaseline = 'top'
  x += 2
  y += 2
  this.fillText(txt, x * times, y * times)
}

function adjustFontSize(font) {
  let fontSizes = font.match(/\d+px/i)

  if (String(fontSizes).length > 0) {
    const fontSizeStr = String(fontSizes)
    const fontSize = fontSizeStr.slice(0, fontSizeStr.length - 2)
    const newFontSizeStr = (fontSize * times) + 'px'
    font = font.replace(fontSizeStr, newFontSizeStr)
  }

  return font
}
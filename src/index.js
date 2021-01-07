class ColorManager {
  constructor (color) {
    this.color = color
  }

  setColor(color) {
    this.color = color
    return this
  }

  getColor() {
    return this.color
  }
}

class MoveManager {
  constructor () {
    this._isDragged = false
  }

  setIsDragged(value) {
    this._isDragged = !!value
    return this
  }

  get isDragged() {
    return this._isDragged
  }
}

const COLORS = new Map([
  ['gray', [50,50,50]],
  ['magenta', [255,0,255]],
  ['red', [255,0,0]],
  ['green', [0,255,0]],
  ['black', [0,0,0]],
  ['deepBlue', [22,122,198]],
])

const DEBUG = false

const colorManager = new ColorManager(COLORS.get('magenta'))
const moveManager = new MoveManager()

async function main() {
  try {
    // Note that a dynamic `import` statement here is required due to
    // webpack/webpack#6615, but in theory `import { greet } from './pkg';`
    // will work here one day as well!
    const { PixelCanvas, Canvas } = await import('../wasm/pkg')
    // const canvas = new Canvas(300, 300)
    // console.log('canvas >>>', canvas);
    const pixelCanvas = new PixelCanvas(400, 400, 16, COLORS.get('gray'))
    drawImage(pixelCanvas)
  
  } catch (error) {
    console.log('Error importing wasm module: ', error);
  }
}

function setupColors() {
  const container = document.createElement('div');
  container.style.background = '#eee'
  container.style.borderRadius = '4px'
  container.style.display = 'flex'
  container.style.alignItems = 'center'
  container.style.justifyContent = 'center'
  container.style.gap = '1rem'
  container.style.padding = '1rem'
  container.style.width = '400px'
  container.style.boxSizing = 'border-box'

  for (const color of COLORS.entries()) {
    const [ title, colorValue ] = color
    const button = createColorButton(colorValue, title, () => {
      colorManager.setColor(colorValue)
    })
    container.append(button)
  }
  document.body.append(container)
}

function createColorButton(color, title, onCLick, isActive) {
  const [r, g, b] = color
  const button = document.createElement('a');
  button.setAttribute('title', title)
  button.setAttribute('role', 'button')
  button.setAttribute('href', '#')
  button.addEventListener('click', onCLick)
  button.style.display = 'block'
  button.style.width = '40px'
  button.style.height = '40px'
  button.style.borderRadius = '40px'
  button.style.background = `rgb(${r}, ${g}, ${b})`
  const activeBorder = `2px solid rgba(255, 0, 0, .5)`
  const notActiveBorder = `2px solid rgba(255, 255, 255, .5)`
  button.style.border = isActive ? activeBorder : notActiveBorder
  button.style.boxSizing = 'border-box'
  return button
}

function setupCanvas(canvasEl, image) {
  canvasEl.style.cursor = 'pointer'
  const { left, top } = canvasEl.getBoundingClientRect();
  const { cellsQty } = image
  const cellWidth = image.width / image.cellsQty
  const cellHeight = image.height / image.cellsQty
  const handleToggleActiveMove = (e) => {
    if (moveManager.isDragged) {
      let xPos = Math.floor((e.clientX - left) / cellWidth)
      let yPos = Math.floor((e.clientY - top) / cellHeight)
      if (xPos > cellsQty - 1) {
        xPos = cellsQty - 1
      }
      if (yPos > cellsQty - 1) {
        yPos = cellsQty - 1
      }
      const index = xPos * cellsQty + yPos;
      image.fillCell(index, colorManager.getColor())
      drawImage(image)
    }
  }
  const handleToggleActive = (e) => {
    if (moveManager.isDragged) {
      return;
    }
    const xPos = Math.floor((e.clientX - left) / cellWidth)
    const yPos = Math.floor((e.clientY - top) / cellHeight)
    console.log({
      xPos, 
      yPos
    });
    const index = xPos * cellsQty + yPos;
    image.fillCell(index, colorManager.getColor())
    drawImage(image)
  }
  canvasEl.addEventListener('click', handleToggleActive)
  canvasEl.addEventListener('mousemove', handleToggleActiveMove)
  canvasEl.addEventListener('mousedown', () => {
    moveManager.setIsDragged(true);
  })
  canvasEl.addEventListener('mouseup', () => {
    moveManager.setIsDragged(false);
  })
}

let canvas = null;

function getCanvas(image) {
  if (canvas) {
    return canvas
  }
  
  canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  setupCanvas(canvas, image)
  document.body.append(canvas)
  setupColors()
  return canvas
}

function drawImage(image) {
  const canvas = getCanvas(image)
  const ctx = canvas.getContext('2d')
  image.draw(ctx)
  image.drawGrid(ctx)
}

main()
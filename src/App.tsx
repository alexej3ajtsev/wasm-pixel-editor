import React from 'react';
import './App.css';

class ColorManager {
  
  constructor (color) {
    // @ts-ignore
    this.color = color
  }

  setColor(color) {
    // @ts-ignore
    this.color = color
    return this
  }

  getColor() {
    //@ts-ignore
    return this.color
  }
}

class MoveManager {
  constructor () {
    //@ts-ignore
    this._isDragged = false
  }

  setIsDragged(value) {
    //@ts-ignore
    this._isDragged = !!value
    return this
  }

  get isDragged() {
    //@ts-ignore
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
]);

const DEBUG = true;

const colorManager = new ColorManager(COLORS.get('magenta'))
const moveManager = new MoveManager()

export const App = () => {
  const canvas = React.useRef(null);
  const ctx = React.useRef(null);
  const pixelCanvas = React.useRef(null);
  const colors = [...COLORS.entries()].reduce((acc,c) => ([
    ...acc,
    {
        title: c[0],
        value: `rgb(${c[1][0]}, ${c[1][1]}, ${c[1][2]})`,
        rawValue: c[1]
    }
  ]), []);

  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    const initCanvas = async () => {
      try {
        ctx.current = canvas.current.getContext('2d')
        // Note that a dynamic `import` statement here is required due to
        // webpack/webpack#6615, but in theory `import { greet } from './pkg';`
        // will work here one day as well!
        const { PixelCanvas } = await import('../wasm/pkg')
        setWidth(400);
        setHeight(400);
        const cellsQty = 16; // Result canvas will contains 16x16 = 256 cells
        pixelCanvas.current = new PixelCanvas(400, 400, cellsQty, COLORS.get('gray') as unknown as Uint8Array)
        handleDrawImage()
      } catch (error) {
        console.log('Error importing wasm module: ', error);
      }
    }
    initCanvas()
  }, []);

  const handleToggleActiveMove = (e) => {
    const { left, top } = canvas.current.getBoundingClientRect();
    const { cellsQty } = pixelCanvas.current;
    const cellWidth = width / cellsQty;
    const cellHeight = height / cellsQty;
    
    if (moveManager.isDragged) {
      let xPos = Math.floor((e.clientX - left) / cellWidth);
      let yPos = Math.floor((e.clientY - top) / cellHeight);
      if (xPos > cellsQty - 1) {
        xPos = cellsQty - 1;
      } else if (xPos < 0) {
        xPos = 0;
      }

      if (yPos > cellsQty - 1) {
        yPos = cellsQty - 1;
      } else if(yPos < 0) {
        yPos = 0;
      }
      const index = xPos * cellsQty + yPos;
      pixelCanvas.current.fillCell(index, colorManager.getColor())
      handleDrawImage()
    }
  }

  const handleToggleActive = (e) => {
    const { left, top } = canvas.current.getBoundingClientRect();
    const { cellsQty } = pixelCanvas.current;
    const cellWidth = width / cellsQty;
    const cellHeight = height / cellsQty;
    if (moveManager.isDragged) {
      return;
    }
    const xPos = Math.floor((e.clientX - left) / cellWidth)
    const yPos = Math.floor((e.clientY - top) / cellHeight)
    const index = xPos * cellsQty + yPos;
    pixelCanvas.current.fillCell(index, colorManager.getColor())
    handleDrawImage()
  }

  const handleDrawImage = () => {
    pixelCanvas.current.draw(ctx.current)
    if (DEBUG) {
      pixelCanvas.current.drawGrid(ctx.current)
    }
  }

  const handleColorClick = (color) => colorManager.setColor(color);
  
  return (
    <>
      <h1 className={"title"}>Hello React WASM!</h1>
      <canvas
        className={"canvas"}
        onClick={handleToggleActive}
        onMouseMove={handleToggleActiveMove}
        onMouseDown={() => {
          moveManager.setIsDragged(true);
        }}
        onMouseUp={() => {
          moveManager.setIsDragged(false);
        }}
        ref={canvas}
        width={width}
        height={height}
      />
      <ul className={"colors"}>
      {colors.map(color => {
        return (
          <li
            key={color.title}
            className={"color"}
            style={{ background: color.value }}
            onClick={() => handleColorClick(color.rawValue)}
          />
        )
      })}
      </ul>
    </>
  )
};
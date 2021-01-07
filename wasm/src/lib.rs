extern crate wasm_bindgen;
extern crate wee_alloc;
extern crate serde;
extern crate web_sys;
#[macro_use]

// Use `wee_alloc` as the global allocator.
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

use wasm_bindgen::prelude::*;
use wasm_bindgen::Clamped;
use std::ops::Add;
use serde::{Serialize, Deserialize};
use web_sys::{CanvasRenderingContext2d, ImageData};

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct Rgb {
    pub r: u8,
    pub g: u8,
    pub b: u8
}

#[wasm_bindgen]
pub struct PixelCanvas {
    width: usize,
    height: usize,
    cellsQty: usize,
    cellsColors: Vec<Rgb>
}

#[wasm_bindgen]
impl PixelCanvas {
    #[wasm_bindgen(constructor)]
    pub fn new(width: usize, height: usize, cellsQty: usize, initial_color: Vec<u8>) -> PixelCanvas {
        let mut cellsColors = Vec::new();
        
        cellsColors.resize(
            cellsQty * cellsQty, // TODO: подумать как расчитать количество ячеек в зависимости от ширины и высоты
            Rgb {
                r: initial_color[0],
                g: initial_color[1],
                b: initial_color[2]
            }
        );

        PixelCanvas {
            width,
            height,
            cellsColors,
            cellsQty
        }
    }

    #[wasm_bindgen]
    pub fn draw(&self, ctx: &CanvasRenderingContext2d) {
        use std::f64;
        use web_sys::console;
        #[derive(Serialize, Deserialize)]
        let cell_width = self.width / self.cellsQty;
        #[derive(Serialize, Deserialize)]
        let cell_height = self.height / self.cellsQty;
        // TODO : console.log with 1 param example
        // console::log_1(&JsValue::from_serde(&cell_width).unwrap());

        ctx.begin_path();
        let mut color_index:usize = 0;
        for x in (0..self.cellsQty) {
            for y in (0..self.cellsQty) {
                let color = self.cellsColors[color_index];
                let color = format!("rgb({r}, {g}, {b})", r = &color.r, g = &color.g, b = &color.b);
                let x_pos:f64 = x as f64 * cell_width as f64;
                let y_pos:f64 = y as f64 * cell_width as f64;
                ctx.set_fill_style(&JsValue::from_serde(&color).unwrap());
                ctx.fill_rect(x_pos, y_pos, cell_width as f64, cell_height as f64);
                color_index = color_index + 1;
                // TODO : console.log with 2 params example
                // console::log_2(&JsValue::from_serde(&color).unwrap(), &JsValue::from_serde(&color).unwrap());
            }
        }
        ctx.stroke();
    }

    #[wasm_bindgen]
    pub fn drawGrid(&self, ctx: &CanvasRenderingContext2d) {
        use std::f64;
        use web_sys::console;

        #[derive(Serialize, Deserialize)]
        let cell_width = self.width / self.cellsQty;
        #[derive(Serialize, Deserialize)]
        let cell_height = self.height / self.cellsQty;

        // set grid color
        ctx.set_fill_style(&JsValue::from_serde(&"black").unwrap());
        ctx.begin_path();

        for x in (0..self.cellsQty) {
            ctx.move_to(x as f64 * cell_width as f64 , 0 as f64);
            ctx.line_to(x as f64 * cell_width as f64, self.width as f64);
        }

        for y in (0..self.cellsQty) {
            ctx.move_to(0 as f64, y as f64 * cell_height as f64);
            ctx.line_to(self.height as f64, y as f64 * cell_height as f64);
        }
        ctx.stroke();
    }

    pub fn fillCell(&mut self, cell_index: usize, color: Vec<u8>) {
        self.cellsColors[cell_index] = Rgb {
            r: color[0],
            g: color[1],
            b: color[2]
        }
    }

    #[wasm_bindgen(getter)]
    pub fn cellsColors(&self) -> JsValue {
        JsValue::from_serde(&self.cellsColors).unwrap()
    }

    #[wasm_bindgen(getter)]
    pub fn cellsQty(&self) -> usize {
        self.cellsQty
    }

    #[wasm_bindgen(getter)]
    pub fn width(&self) -> usize {
        self.width
    }

    #[wasm_bindgen(getter)]
    pub fn height(&self) -> usize {
        self.height
    }
}

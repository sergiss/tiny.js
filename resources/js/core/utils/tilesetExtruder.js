/*
 * Sergio S. - 2023
 * https://github.com/sergiss/tiny.js
 */

export const extrudeTileset = (img, cols, rows, pixels) => {

    // Image dimensions
    const {width, height} = img;

    // Output canvas
    const canvas = document.createElement("canvas");
    
    const ctx = canvas.getContext("2d");
    canvas.width  = width;
    canvas.height = height;    
    ctx.drawImage(img, 0, 0);

    // Source data
    const data = ctx.getImageData(0, 0, width, height).data;
    
    const tileWidth  = width  / cols;
    const tileHeight = height / rows;

    // Output data
    const imageData = new ImageData(
        (tileWidth  + (pixels << 1)) * cols, // width
        (tileHeight + (pixels << 1)) * rows  // height
    );

    let index, i, j, x, y, s, sx, sy, _sx, _sy, tx, ty, _tx, _ty;
    for (i = 0; i < cols; ++i) { // iterate columns
      sx = i * tileWidth; // source x
      tx = pixels + i * (tileWidth  + (pixels << 1)); // target x

      for (j = 0; j < rows; ++j) { // iterate rows 
        sy = j * tileHeight; // source y
        ty = pixels + j * (tileHeight + (pixels << 1)); // target y

        for (x = 0; x < tileWidth; ++x) { // iterate tile width
          _sx = sx + x; // source offset x
          _tx = tx + x; // target offset y

          for (y = 0; y < tileHeight; ++y) { // iterate tile height    
            _sy = sy + y; // source offset y
            _ty = ty + y; // target offset y

            index = (width * _sy + _sx) << 2; // sourde data index

            // Draw tile pixel
            setRGBA(imageData,_tx, _ty, data, index);
                   
            // Extrude tile pixel
            if (x == 0) { // Left
              for (s = _tx - pixels; s < _tx; ++s) {
                setRGBA(imageData, s, _ty, data, index);
                if (y == 0) { // Left Top
                  for(let s1 = 1; s1 <= pixels; ++s1)
                    setRGBA(imageData,s, _ty - s1, data, index);
                } else if (y == tileHeight - 1) { // Left Bottom
                  for(let s1 = 1; s1 <= pixels; ++s1)
                    setRGBA(imageData,s, _ty + s1, data, index);
                }
              }              
            } else if (x == tileWidth - 1) { // Right
              for (s = _tx + pixels; s > _tx; --s) {
                setRGBA(imageData,s, _ty, data, index);
                if (y == 0) { // Right Top
                  for(let s1 = 1; s1 <= pixels; ++s1)
                    setRGBA(imageData,s, _ty - s1, data, index);
                } else if (y == tileHeight - 1) { // Right Bottom
                  for(let s1 = 1; s1 <= pixels; ++s1)
                    setRGBA(imageData,s, _ty + s1, data, index);
                }
              }              
            }
            
            if (y == 0) { // Top
              for (s = _ty - pixels; s < _ty; ++s) {
                setRGBA(imageData,_tx, s, data, index);
              }              
            } else if (y == tileHeight - 1) { // Bottom
              for (s = _ty + pixels; s > _ty; --s) {
                setRGBA(imageData,_tx, s, data, index);
              }              
            }

          }
        }

      }
    }

    // Generate Image
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

const setRGBA = (imageData, x, y, data, index)=> {
    const i = (imageData.width * y + x) << 2; // target Index
    imageData.data[i    ] = data[index    ];
    imageData.data[i + 1] = data[index + 1];
    imageData.data[i + 2] = data[index + 2];
    imageData.data[i + 3] = data[index + 3];
}
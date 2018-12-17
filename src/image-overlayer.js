class ImageOverlayr {
  constructor(Types, Sharp) {
    this.types = Types;
    this.sharp = Sharp;
  }

  getImageType(type, def = 'jpg') {
    const found = this.types.find(item => item.sharp === type);

    if (!found && type === def) {
      return { sharp: def, contentType: `image/${def}` };
    }

    return found || this.getImageType(def, def);
  }

  overlay(image, overlay, type, gravity, top, left, tile, greyscale, square) {
    if (!image) throw new Error('An Image must be specified');
    if (!overlay) throw new Error('Image overlay must be specified');

    const sharpType = this.getImageType(type, 'jpg');

    var imageSharp = this.sharp(new Buffer(image.buffer));
    var overlaySharp = this.sharp(new Buffer(overlay.buffer));
    return new Promise((res, rej) => {
      imageSharp
        .metadata().then(function(imageMetadata) {
          overlaySharp.metadata().then(function(overlayMetadata) {
            if (square) {
              var min = Math.min(imageMetadata.width, imageMetadata.height);
              var width = min;
              var height = min;
            } else {
              var width = imageMetadata.width;
              var height = imageMetadata.height;
            }
            overlaySharp.resize(width, height).toBuffer().then(overlayData => {
              imageSharp
                .resize(width, height)
                .greyscale(greyscale)
                .overlayWith(overlayData, { gravity: gravity, top: top, left: left, tile: tile })
                .toBuffer()
                .then(data => {
                  return res({
                    image: data,
                    contentType: sharpType.contentType,
                  });
                })
                .catch(err => rej(err))
            });
          })
        })

    })
  }
}

module.exports = ImageOverlayr;

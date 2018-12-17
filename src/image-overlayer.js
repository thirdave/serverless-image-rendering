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
    return new Promise((res, rej) => {
      imageSharp
        .metadata().then(function(metadata) {
          console.log('Meta', metadata);
          if(square){
            var min = Math.min(metadata.width, metadata.height);
            var width = min;
            var height = min;
          } else {
            var width = metadata.width;
            var height = metadata.height;
          }
          imageSharp
            .overlayWith(overlay, { gravity: gravity, top: top, left: left, tile: tile })
            .greyscale(greyscale)
            .resize(width, height)
            .toBuffer()
            .then(data => {
              return res({
                image: data,
                contentType: sharpType.contentType,
              });
            })
            .catch(err => rej(err))
        })

    })
  }
}

module.exports = ImageOverlayr;

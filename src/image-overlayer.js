class ImageOverlayr {
  constructor(Types, Sharp) {
    this.types = Types;
    this.sharp = Sharp;
  }

  getImageType(type, def = 'webp') {
    const found = this.types.find(item => item.sharp === type);

    if (!found && type === def) {
      return { sharp: def, contentType: `image/${def}`};
    }

    return found || this.getImageType(def, def);
  }

  overlay(image, overlay, type, gravity, top, left, tile) {
    if (!image) throw new Error('An Image must be specified');
    if (!overlay) throw new Error('Image overlay must be specified');

    const sharpType = this.getImageType(type, 'webp');

    return new Promise((res, rej) => {
      this.sharp(new Buffer(image.buffer))
        .overlayWith(overlay, {gravity: gravity, top: top, left: left, tile: tile})
        .toBuffer()
        .then(data => {
          return res({
            image: data,
            contentType: sharpType.contentType,
          });
        })
        .catch(err => rej(err))
    });

  }
}

module.exports = ImageOverlayr;

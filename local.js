const app = require('express')();
const bodyParser = require('body-parser');
const Sharp = require('sharp');
const async = require('async');
const Types = require('./src/types');
const ImageFetcher = require('./src/s3-image-fetcher');
const ImageResizr = require('./src/image-resizer');
const ImageOverlayr = require('./src/image-overlayer');

require('dotenv').config();

app.use(bodyParser.json());

const displayStatus = () => ({
  status: `OK`, });

app.get('/status', (req, res) => {
  res.status(200).send(displayStatus());
});


app.get('/resize-image', (req, res) => {
  const imageFetcher = new ImageFetcher(process.env.BUCKET);
  const imageResizr = new ImageResizr(Types, Sharp);

  const fileName = req.query && req.query.f;
  const quality = req.query && +req.query.q || 100;
  const type = req.query && req.query.t;
  const size = {
    w: req && +req.query.w || null,
    h: req && +req.query.h || null,
  };

  return imageFetcher.fetchImage(fileName)
    .then(data => imageResizr.resize(data.image, size, quality, type))
    .then(data => {
      const img = new Buffer(data.image.buffer, 'base64');

      res.writeHead(200, {
        'Content-Type': data.contentType
      });
      res.end(img);
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(400).send(error.message || error);
    });
});


app.get('/overlay-image', async (req, res) => {
  const imageFetcher = new ImageFetcher(process.env.BUCKET);
  const imageOverlayr = new ImageOverlayr(Types, Sharp);

  const fileName = req.query && req.query.f;
  const overlay = req.query && req.query.o;
  const gravity = req.query && req.query.g;  
  const top = req.query && req.query.x;
  const left = req.query && req.query.y;
  const tile = (req.query && req.query.tile === 'true');
  const type = req.query && req.query.t;

  const bw = (req.query && req.query.bw == 'true');
  const square = (req.query && req.query.square == 'true');

  // const overlayData = await imageFetcher.fetchImage(overlay);

    async.series({
    one: function(callback) {
        imageFetcher.fetchImage(overlay).then(function(data) { 
          console.log("Overlay", data);
          var overlayData = data.image; 
          callback(null, overlayData)
        });
    },
    two: function(callback){
        imageFetcher.fetchImage(fileName).then(function(data) { 
          console.log("Image", data);
          var imageData = data.image; 
          callback(null, imageData)
        });
    }
}, function(err, results) {
    console.log("RESULTS", top, left);
  return imageOverlayr.overlay(results.two, results.one, type, gravity, parseInt(top) || 0, parseInt(left) || 0, tile, bw, square)
    .then(data => {
      const img = new Buffer(data.image.buffer, 'base64');

      res.writeHead(200, {
        'Content-Type': data.contentType
      });
      res.end(img);
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(400).send(error.message || error);
    });

});

});

app.get('/fetch-image', (req, res) => {
  const imageFetcher = new ImageFetcher(process.env.BUCKET);
  const fileName = req.query && req.query.f;

  return imageFetcher.fetchImage(fileName)
    .then(data => {
      const contentType = data.contentType;
      const img = new Buffer(data.image.buffer, 'base64');

      res.writeHead(200, {
        'Content-Type': contentType
      });
      res.end(img);
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(400).send(error.message || error);
    });
});

const server = app.listen(3000, () =>
  console.log(`Listening on http://localhost:${server.address().port}`));

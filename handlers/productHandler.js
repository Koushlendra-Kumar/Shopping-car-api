const Product = require('../models/products');
const { body, validationResult } = require('express-validator');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');

let success;
let failure;

const mongoURI = process.env.MONGODB_URI || 
    'mongodb+srv://furniture-shop:myfurniture@furniture-shop.yigjpzo.mongodb.net/products?retryWrites=true&w=majority';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

process.on('unhandledRejection', err => {
  console.log('unhandledRejection', err.message);
});

// creating bucket
let bucket;
mongoose.connection.on('connected', () => {
  let client = mongoose.connections[0].client;
  let db = mongoose.connections[0].db;
  bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName : 'uploads'
  });
});

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage }).single('image');

exports.products_list = ( req, res, next ) => {

  let successMessage = success !== 'undefined' 
          ? success : false;
  let failureMessage = failure !== 'undefined' 
          ? failure : false;

  Product.find({})
        .sort([['timestamp', 'descending']])
        .exec((err, result) => {
          if(err) {
            res.status(404).json({message: 'No products found!'});
          }

          if(result.length !== 0) {
            const file = bucket
              .find({
                contentType: 'image/jpeg' || 'image/jpg' || 'image/png'
              })
              .toArray((err, files) => {

                if(err) {
                  res.status(404).json({message: 'No images found'});

                } else if (!files || files.length === 0) {
                  return res.status(200).json({
                        title: 'Modern House | Products', 
                        successMessage: successMessage,
                        failureMessage: failureMessage,
                        result: result,
                        files: false,
                        message: 'No products found!!'
                  })
                }
                res.status(200).json({
                  title: 'Modern House | Products', 
                  successMessage: successMessage,
                  failureMessage: failureMessage,
                  result: result,
                  files: files,
                  message: false
                })
              });
          }
        })
};

exports.individual_product_get = ( req, res ) => {
  Product.findById(req.params.id)
        .exec((err, result) => {
            if(err) {
              console.log('error finding that image',err);
              res.status(404).json({title: '404 Error', err: err})
            };

            if(result) {
              const file = bucket
              .find({
                filename: result.image
              })
              .toArray((err, files) => {
                if(err) {
                  console.log(err);
                } else if (!files || files.length === 0) {
                  return res.status(404).json({
                        title: result.title,
                        result: result,
                        files: false,
                        message: 'No products found!!'
                  })
                }
                
                res.status(200).json({
                  title: result.title, 
                  result: result,
                  files: files,
                  message: false
                })
              });
            }
        })
};

exports.create_product_post = [
    body('title').trim().escape(),
    body('description').trim().escape(),
    body('price').trim().escape(),
    body('quantity').trim().escape(),

    (req, res, next ) => {
        upload(req, res, (err) => {
            const errors = validationResult( req );
            
            if(err) {
                console.log('error uploading image', err);
                res.status(404).json({msg: 'failed to upload image'})
            }

            let newProduct = new Product({
                    title: req.body.title,
                    image: req.file.filename,
                    description: req.body.description,
                    price: req.body.price,
                    quantity: req.body.quantity,
                    timestamp: new Date()
                });
            
            if(!errors.isEmpty()) {
                failure = 'Failed to add your product.'
                console.log(errors.array())
                res.redirect('/products');
            } else {
                newProduct.save ((err) => {
                if (err) throw err;
                success ='Product added successfully!';
                res.redirect('/products');
              })
            }
      })          
    }
]

exports.update_product_post = ( req, res ) => {
  
  let updates = {
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    quantity: req.body.quantity
  }
  Product.findByIdAndUpdate(req.params.id, updates, (err, update)=> {
    console.log('updated successfully');
    if(err) throw err;
    res.redirect(`/products/${req.params.id}`);
  })
};

exports.delete_product = ( req, res ) => {
  Product.findByIdAndDelete(req.params.id, (err, docs) => {
    if(err) throw err;
    res.redirect('/products');
  });
}
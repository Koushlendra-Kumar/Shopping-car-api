const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

const indexRouter = require('./routes/api/v1/index');
const productRouter = require('./routes/api/v1/product');

//Production best practices
const compression = require('compression');
const helmet = require('helmet');

const app = express();

//Database connection
const mongoDB = process.env.MONGODB_URI || 
  'mongodb+srv://furniture-shop:myfurniture@furniture-shop.yigjpzo.mongodb.net/products?retryWrites=true&w=majority';

mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(console.log('connected'))
  .catch((err)=> {
    console.log('error occured while connection to the database', err)
  });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Database connection error.'));

app.use(helmet());
app.use(compression()); //compress all routes
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/products', productRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).json({err});
});

module.exports = app;

let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
var router = express.Router();
let session = require('express-session');
let passport = require('passport');
let passportLocal = require('passport-local');
let localstrategy = passportLocal.Strategy
let flash = require('connect-flash');
let app = express();
//create a user model instance
let userModel = require('../models/user');
let User = userModel.User;


//config mongoDB
let mongoose = require('mongoose');
let DB = require('./db');

//point DB to mongoose URI
mongoose.connect(DB.URI);
let mongoDB = mongoose.connection;
mongoDB.on('error',console.error.bind(console,'Connection Error:'));
mongoDB.once('open',()=>{
  console.log('connected to MongoDB');
})
//Set up express session
app.use(session({
  secret:"SomeSecret",
  saveUninitialized:false,
  resave:false,
}))

//implement a User Authentication
passport.use(User.createStrategy());

//serialize and deserialize user information
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//initialize passport
app.use(passport.initialize());
app.use(passport.session());


//initialize flash
app.use(flash());


// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.static(path.join(__dirname, '../../node_modules')));


let indexRouter = require('../routes/index');
let usersRouter = require('../routes/users');
let assignmentsRouter = require('../routes/assignment');


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/assignmentlist',assignmentsRouter)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error',
  {
    title:"Error"    
  }
  );
});

module.exports = app;

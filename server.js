// import necessary dependenicies
const express = require('express');
const ejs = require('ejs');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require("path");
const methodOverride = require('method-override');
const passport = require('passport');


// initialize app
const app = express();

// map mogooose Promise to global Promise to get rid of warning
mongoose.Promise = global.Promise;

// initialize mongodb connection to mongoose library 
mongoose.connect('mongodb+srv://shantoislam123:emIe7DjLYT6LGo6z@cluster0-miwmg.mongodb.net/blogs?retryWrites=true&w=majority',{
    useNewUrlParser: true,
    useUnifiedTopology:true,
    useCreateIndex: true,
})
.then(()=> console.log('connected to the database'))
.catch(err=> console.log(err));


//template engine config
app.set("view engine", 'html');
app.engine('html', ejs.renderFile);

//set default static file reponse middlware
app.use(express.static(path.join(__dirname, 'public')));

// override with POST Method 
app.use(methodOverride('_method'))

// initialize and use session middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// parse application/json
app.use(express.json());

// initialize passport
app.use(passport.initialize());
app.use(passport.session());


// Initialize connection flash 
app.use(flash());


// set local properties based on middlware req and res
app.use((req, res, next)=>{

    //set flash message
    app.locals.success_fmsg = req.flash('success_fmsg');
    app.locals.warning_fmsg = req.flash('warning_fmsg');
    app.locals.normal_fmsg = req.flash('normal_fmsg');
    app.locals.danger_fmsg = req.flash('danger_fmsg');
    app.locals.user = req.user || null
    next();
});


// import router middleware
const blogRoute = require('./routes/blogRoute');
const userAutheticationRouter = require('./routes/authUser');

// authentication middleware router
app.use(userAutheticationRouter);
// index page
app.get('/', (req, res)=>{
    res.render('index');
});
// Blog routeer
app.use(blogRoute)


// create a server
const port = process.env.PORT || 3200;
app.listen(port, '127.0.0.1', ()=> console.log(`Server is listenting to port ${port}`));
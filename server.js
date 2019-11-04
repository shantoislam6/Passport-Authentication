// import necessary dependenicies
const express = require('express');
const ejs = require('ejs');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require("path");
const methodOverride = require('method-override');
const passport = require('passport');
const randomstring = require('randomstring'); 


// initialize app
const app = express();

// map mogooose Promise to global Promise to get rid of warning
mongoose.Promise = global.Promise;

// initialize mongodb connection to mongoose library 
mongoose.connect((process.env.NODE_ENV == 'production') ? 'mongodb+srv://shantoislam123:emIe7DjLYT6LGo6z@cluster0-miwmg.mongodb.net/blogs?retryWrites=true&w=majority' : 'mongodb://127.0.0.1:27017/blogs',{
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

const User = require('./models/user');
const sendVericiaionTokenToMail = require('./mails/mailer');

//send verfication totken
app.get('/sendverifytoken', (req, res, next)=>{
    if(req.user){
        const verify = req.user.verification;
        if(!verify.isVerified){
            const token = randomstring.generate(32);
            User.updateOne({_id: req.user.id},{ 
                verification:{
                    created_at: Date.now(),
                    token:token
                }
             }).then(()=>{
                sendVericiaionTokenToMail(req.user.email, token).then(()=>{
                    req.flash('success_fmsg', 'Verfiacation token has been sent to your email.');
                    res.redirect('/');
               }).catch(err=> console.log(err));
            });
            return;
        }
        next();
        return;
    }
    
    next();
});

app.get('/verifing', (req, res, next)=>{
    if(req.isAuthenticated()){
        const requestToken = req.query.token;
        const authUser = req.user.verification;
        if(!authUser.isVerified){
           const currentMiniutes = Date.now();
           const tokenMiniutes =  parseInt(authUser.created_at);
           const expirdMinute = ((currentMiniutes - tokenMiniutes) / 1000) / 1000;

            if(expirdMinute < 5){
                if(requestToken == authUser.token){
                    User.updateOne({_id:req.user.id}, {
                        verification:{
                            isVerified:true,
                        }
                    }).then(()=>{
                        req.flash('success_fmsg', 'You have been verified successfully!!');
                        res.redirect("/");
                    })
                }else{
                    req.flash('danger_fmsg', 'Invalid token!! Click "Send Again" ');
                    res.redirect("/");
                }
            }else{
                req.flash('warning_fmsg', 'Verification token has been expired, please send again!!');
                res.redirect('/');
            }
            return;
        }
        req.flash('warning_fmsg', 'You have already varified your account!!');
        res.redirect('/');
        return;
    }
    next();
});

//verfication middleware
app.use((req,res,next)=>{
    if(req.isAuthenticated()){
        const verify = req.user.verification;
        if(verify.isVerified){
            next();
            return;
        }
        res.render('verify');
        return;
    }else{
        next();
    }
});




// index page
app.get('/', (req, res)=>{
    res.render('index');
});

// Blog routeer
app.use(blogRoute)


console.log(process.env.ADMIN_EMAIL_API_KEY);


// create a server
const port = process.env.PORT || 3200;
app.listen(port, ()=> console.log(`Server is listenting to port ${port}`));
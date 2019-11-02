
module.exports = function(passport, LocalStrategy, User, bcrypt){
    // initalize passport local strategy config
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField : 'password',
        passReqToCallback: true,  
    }, (req, email, password, done)=>{

        User.findOne({email: email}).then(user=>{
            if(user){
                bcrypt.compare(password, user.password).then((res) => {
                if(res){
                    done(null, user, req.flash('success_fmsg', 'You Are Logged In Successfully!!'));
                }else{
                    done(null, false, req.flash('danger_fmsg', 'Password Incorrect!!'));
                }
                });
            }else{
                done(null, false, req.flash('danger_fmsg', 'No User Found!!'));
            }
        })
    }));

    // serialize and deserialize user
    passport.serializeUser((user, done)=>{
        done(null, user.id);
    })
    
    passport.deserializeUser((id, done)=>{
        User.findById(id).then(user=>{
            done(null, user);
        }).catch(err=>{
            done(err, false);
        });
    });
}
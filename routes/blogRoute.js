const Route = require('express').Router();

// get blog model
const Blog = require('../models/blog');


//Initialize Global Auth Middleware for blog to prevent request if user is not authenticate
Route.use((req, res, next)=>{
    if(req.isAuthenticated()){
        next();
    }else{
        req.flash('warning_fmsg', 'Unauthorized request, Please Try to Login, First  of all !!')
        res.redirect('/login');
    }
});




// bloging router
Route.get('/blogs',(req, res)=>{
    Blog.find({}).sort('-created_at').then(blogs=>{
        res.render('blog/index', {blogs: blogs});
    }).catch(err=>{
        console.log(err);
    })
});



// Add a new blog
Route.route('/addblog')
.get((req, res)=>{
    res.render('blog/addblog',{editorMode: true });
})
.post((req, res)=>{
    req.body.user_id = req.user._id;
    Blog.create(req.body).then(()=>{
        req.flash('success_fmsg', 'A New Blog Has Been Creaded!!');
        res.redirect("/blogs");
    })
})

// When auth user try to delete and update then redirect them to promt
Route.route('/editblog/:id')
.get((req, res)=>{
    Blog.findById(req.params.id).then(blog=>{
        res.render('blog/editblog', { blog: blog, editorMode: true });
    })
})
.put((req, res)=>{
    res.render('promt', {
        type: 'UPDATE',
        data: Buffer.from(JSON.stringify(req.body), 'utf8').toString('hex'),
        _id : req.params.id,
        back: req.url
    });
})

Route.delete("/deleteblog/:id", (req, res)=>{
    res.render('promt', {
        type: 'DELETE',
        data: '',
        _id : req.params.id,
        back: '/blogs'
    });
})


// delete and update operation
Route.post('/promt/:type/:id', (req, res)=>{
    const type = req.params.type;
    const _id = req.params.id;
    Blog.findOne({_id: _id}).then(blog=>{
        /* 
         *First of make sure that the blog has been created by autheticated user then alow them to delete *and update blog */

        if(blog.user_id == req.user.id){
            if(type == 'update'){

                const body = JSON.parse(Buffer.from(req.body.data, 'hex').toString('utf8'));
               blog.updateOne(body).then(()=>{
                 req.flash('normal_fmsg', 'Blog has been Updated!!');
                 res.redirect('/blogs');
               })

            }else if(type == 'delete'){

                blog.delete().then(()=>{
                    req.flash('normal_fmsg', 'Blog has been Deleted!!');
                    res.redirect('/blogs');
                });

            }else{
                res.redirect('/');
            }
        }else{
            req.flash('warning_fmsg', 'Unauthorized request !!')
            res.redirect('/blogs');
        }

    });
});


module.exports = Route;
require("dotenv").config();
var express          = require("express"),
    app              = express(),
    nodemailer       = require('nodemailer');
    bodyParser       = require("body-parser"),
    mongoose         = require("mongoose"),
    passport         = require("passport"),
    cookieParser     = require("cookie-parser"),
    LocalStrategy    = require("passport-local"),
    flash            = require("connect-flash"),
    OurProduct       = require("./models/ourproduct"),
    Features         = require("./models/features"),
    User             = require("./models/user"),
    Services         = require("./models/services"),
    session          = require("express-session"),
    methodOverride   = require("method-override"),
    request          = require("request"),
    path             = require("path"),
    multer           = require("multer"),
    storage          = multer.diskStorage({
                          destination: './public/uploads/',
                          filename: function(req, file, cb){
                            cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
                          }
                        });    
    const upload     =  multer({
                              storage: storage,
                              limits:{fileSize: 1000000},
                              fileFilter: function(req, file, cb){
                                checkFileType(file, cb);
                              }
                            });


function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif|svg|pdf/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}


mongoose.connect("mongodb://localhost/tenovaters");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname , "/public")));
app.use(methodOverride('_method'));
app.use(cookieParser('secret'));



app.use(require("express-session")({
    secret: "tenovaters",
    resave: false,
    saveUninitialized: false
}));


app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});


app.use('/images', express.static(path.join(__dirname, 'images')));


app.get("/",function(req,res){
     res.render("index");
});

app.post('/',(req,res)=>{
    

    var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
            user: process.env.USER,
            pass: process.env.PASS
        }
    });


    const mailOptions = {
      name:req.body.name,
      email: req.body.email,
      to: process.env.TO,
      subject: `${req.body.subject}`,
      html: `<h3>Name: ${req.body.name} <br> From: ${req.body.email} <br> subject: ${req.body.subject} <br> Message: ${req.body.message}</h3>`
    };


    transporter.sendMail(mailOptions, function (err, info) {
       if(err){
            console.log(err);
            req.flash('error', err.message);
            res.send('err');
        }
       else{
            console.log(info);
            req.flash("success","Successfully Sent!!");
            res.redirect("/tenovaters");
       }
    });
});

app.get("/tenovaters", function(req, res){
    res.render("index");
});

app.post('/tenovaters',(req,res)=>{
    

    var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
            user: process.env.USER,
            pass: process.env.PASS
        }
    });


    const mailOptions = {
      name:req.body.name,
      email: req.body.email,
      to: process.env.TO,
      subject: `${req.body.subject}`,
      html: `<h3>Name: ${req.body.name} <br> From: ${req.body.email} <br> Phone: ${req.body.phone} <br> Query: ${req.body.query}</h3>`
    };


    transporter.sendMail(mailOptions, function (err, info) {
       if(err){
            console.log(err);
            req.flash('error', err.message);
            res.send('err');
        }
       else{
            console.log(info);
            req.flash("success","Successfully Sent!!");
            res.redirect("back");
       }
    });
});

app.get("/tenovaters/ourproduct", function(req,res){
    OurProduct.find({}, function(err, ourproduct){
       if(err){
           console.log(err);
       } else { 
                res.render("ourproduct/show",{ourproduct:ourproduct});}

    });
})

app.post("/tenovaters/ourproduct", upload.array('image',4), function(req, res){


    var heading = req.body.heading;
    var subheading = req.body.subheading;
    var maindesc = req.body.maindesc;
    var subdesc = req.body.subdesc;
    var newProduct = {heading:heading , subheading:subheading , image1:`/uploads/${req.files[0].filename}` , image2:`/uploads/${req.files[1].filename}` ,  image3:`/uploads/${req.files[2].filename}` ,image4:`/uploads/${req.files[3].filename}`, maindesc:maindesc , subdesc:subdesc}
    console.log(newProduct);

    OurProduct.create(newProduct, function(err, newlyCreated){
        if(err){
            console.log(err);
            res.flash('error','some error occured');
            res.redirect("back");
        } else {
            console.log(newlyCreated);
            req.flash('success','successfully added');
            res.redirect("/tenovaters/ourproduct");
        }
    });
});

app.get("/tenovaters/ourproduct/new",  function(req, res){
   res.render("ourproduct/new"); 
});


app.get("/tenovaters/ourproduct/:id", function(req, res){
   OurProduct.find({}, function(err, ourproducts){
       if(err){
           console.log(err);
       } else { 
            OurProduct.findById(req.params.id ,function(err, ourproduct){
                if(err){
                    console.log(err);
                } else {
                    console.log(ourproduct)
                    //render show template with that campground
                    res.render("ourproduct/product", {ourproduct: ourproduct , ourproducts:ourproducts});
                }
            });
        }

    }); 
});
app.get("/tenovaters/ourproduct/:id/edit", function(req, res){
   console.log("IN EDIT!");
    //find the campground with provided ID
    OurProduct.findById(req.params.id, function(err, foundProduct){
        if(err){
            console.log(err);
        } else {
            //render show template with that campground
            res.render("ourproduct/edit", {ourproduct: foundProduct});
        }
    });
});

app.put("/tenovaters/ourproduct/:id", upload.array('image',4), function(req, res){
    var heading = req.body.heading;
    var maindesc = req.body.maindesc;
    var subdesc  =  req.body.subdesc;
    var newData = {heading:heading , image1:`/uploads/${req.files[0].filename}` , image2:`/uploads/${req.files[1].filename}` ,  image3:`/uploads/${req.files[2].filename}` ,image4:`/uploads/${req.files[3].filename}` ,  maindesc:maindesc , subdesc:subdesc};

    OurProduct.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, ourproduct){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/tenovaters/ourproduct");
        }
    });
});

app.delete("/tenovaters/ourproduct/:id",function(req,res){
    OurProduct.findByIdAndRemove(req.params.id,function(err,ourproduct){
        if(err){console.log(err);}
        else{req.flash("success", "Your Product has deleted " );
                res.redirect("/tenovaters/ourproduct");
            }
    });
});

app.get("/tenovaters/services", function(req,res){
    Services.find({}, function(err, services){
       if(err){
           console.log(err);
       } else { 
                res.render("services/main",{services:services});}

    });
});

app.post("/tenovaters/services", upload.array('image',4), function(req, res){
    // get data from form and add to campgrounds array
    var heading = req.body.heading;
    var maindesc = req.body.maindesc;
    var subdesc = req.body.subdesc;
    console.log(req.files);
    var newService = {heading:heading , image1:`/uploads/${req.files[0].filename}` , image2:`/uploads/${req.files[1].filename}` ,  image3:`/uploads/${req.files[2].filename}` ,image4:`/uploads/${req.files[3].filename}` ,maindesc:maindesc,subdesc:subdesc}
    Services.create(newService, function(err, newlyCreated){
        if(err){
            console.log(err);
            res.flash('error','some error occured');
            res.redirect("back");
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.flash('success','successfully added');
            res.redirect("/tenovaters/services");
        }
    });
});



app.get("/tenovaters/services/new",  function(req, res){
   res.render("services/new"); 
});


app.get("/tenovaters/services/:id", function(req, res){
    Services.findById(req.params.id ,function(err, services){
        if(err){
            console.log(err);
        } else {
            console.log(services)
            //render show template with that campground
            res.render("services/show", {services: services});
        }
    });
});

app.get("/tenovaters/services/:id/edit", function(req, res){
   console.log("IN EDIT!");
    //find the campground with provided ID
    Services.findById(req.params.id, function(err, services){
        if(err){
            console.log(err);

        } else {
            //render show template with that campground
            res.render("services/edit", {services: services});
        }
    });
});

app.put("/tenovaters/services/:id", upload.array('image',4) , function(req, res){
    var heading = req.body.heading;
    var maindesc = req.body.maindesc;
    var subdesc = req.body.subdesc;
    var newData = {heading:heading , image1:`/uploads/${req.files[0].filename}` , image2:`/uploads/${req.files[1].filename}` ,  image3:`/uploads/${req.files[2].filename}` ,image4:`/uploads/${req.files[3].filename}` ,maindesc:maindesc , subdesc:subdesc}
    Services.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, services){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/tenovaters/services");
        }
    });
});
app.delete("/tenovaters/services/:id",function(req,res){
    Services.findByIdAndRemove(req.params.id,function(err,services){
        if(err){console.log(err);}
        else{req.flash("success", "Your service has deleted " );
                res.redirect("/tenovaters/services");
            }
    });
});

app.get("/tenovaters/features", function(req,res){
    Features.find({}, function(err, features){
       if(err){
           console.log(err);
       } else { 
                res.render("features/features",{features:features});}

    });
})

app.post("/tenovaters/features", upload.array('image',4), function(req, res){
    var heading = req.body.heading;
    var maindesc = req.body.maindesc;
    var subdesc = req.body.subdesc;
    var newFeatures = {heading:heading , image1:`/uploads/${req.files[0].filename}` , image2:`/uploads/${req.files[1].filename}` ,  image3:`/uploads/${req.files[2].filename}` ,image4:`/uploads/${req.files[3].filename}` ,  maindesc:maindesc , subdesc:subdesc}
    // Create a new campground and save to DB
    Features.create(newFeatures, function(err, newlyCreated){
        if(err){
            console.log(err);
            res.flash('error','some error occured')
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            req.flash('success',"successfully added")
            res.redirect("/tenovaters/features");
        }
    });
});

app.get("/tenovaters/features/new", function(req, res){
   res.render("features/new"); 
});


app.get("/tenovaters/features/:id", function(req, res)
{
    Features.find({}, function(err, careers){
       if(err){
           console.log(err);
       } else { 
                Features.findById(req.params.id ,function(err, features){
                    if(err){
                        console.log(err);
                    } else {
                        //render show template with that campground
                        res.render("features/job", {features: features, careers:careers});
                    }
                });
            }
        });
});

app.get("/tenovaters/features/:id/edit",  function(req, res){
   console.log("IN EDIT!");
    //find the campground with provided ID
    Features.findById(req.params.id, function(err, foundFeatures){
        if(err){
            console.log(err);
        } else {
            //render show template with that campground
            res.render("features/edit", {features: foundFeatures});
        }
    });
});

app.put("/tenovaters/features/:id",upload.array('image',4), function(req, res){
    var heading = req.body.heading;
    var maindesc = req.body.maindesc;
    var subdesc = req.body.subdesc;
    var newData = {heading:heading , image1:`/uploads/${req.files[0].filename}` , image2:`/uploads/${req.files[1].filename}` ,  image3:`/uploads/${req.files[2].filename}` ,image4:`/uploads/${req.files[3].filename}` , maindesc:maindesc , subdesc:subdesc};
    Features.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, services){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/tenovater/features");
        }
    });
});
app.post('/tenovaters/features/:id',upload.single('resume'),(req,res)=>{


    var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
            user: process.env.USER,
            pass: process.env.PASS
        }
    });


    const mailOptions = {
      job:req.body.job,
      name:req.body.name,
      email: req.body.email,
      to: process.env.TO,
      attachments: [
        { filename: `${req.file.filename}` , path:`./public/uploads/${req.file.filename}`}
      ],
      html: `<h3>Job Title: ${req.body.job} <br> Name: ${req.body.name} <br> From: ${req.body.email} <br> Phone: ${req.body.phone} <br><h3>`
    };

    transporter.sendMail(mailOptions, function (err, info) {
       if(err){
            console.log(err);
            req.flash('error', err.message);
            res.send('err');
        }
       else{
            console.log(info);
            req.flash("success","Successfully Sent!!");
            res.redirect("back");
       }
    });
});


app.delete("/tenovaters/features/:id",function(req,res){
    Features.findByIdAndRemove(req.params.id,function(err,features){
        if(err){console.log(err);}
        else{req.flash("success", "Your careers has deleted " );
                res.redirect("/tenovaters/features");
            }
    });
});







app.get("/tenovaters/signup", function(req, res){
   res.render("signup"); 
});

//handle sign up logic
app.post("/tenovaters/signup", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            res.redirect("/tenovaters/signup");
        }else{  passport.authenticate("local")(req, res, function(){
                req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
                res.redirect("/tenovaters"); 
                });
              }
            });
});

//show login form
app.get("/tenovaters/login", function(req, res){
  res.render("login"); 
});

//handling login logic
app.post("/tenovaters/login", passport.authenticate("local", 
    {
        successRedirect: "/tenovaters",
        failureRedirect: "/tenovaters/login"
    }), function(req, res){
});

// logout route
app.get("/tenovaters/logout", function(req, res){
   req.logout();
   req.flash("success", "LOGGED YOU OUT!");
   res.redirect("/tenovaters");
});



function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        if(currentUser)
        return next();
    }
    else{
      req.flash("error", "You need to be logged in to do that");
      res.redirect("/login");
    }  
}

function rights(req,res,next)
{
    if(req.isAuthenticated())
    {
        Campground.findById(req.params.id,function(err,campground){
        if (err) 
        {
            req.flash("error", "Campground not found");
            res.redirect("back");
        }
        else
        {
            if(campground.author.id.equals(req.user._id)){next();}/*wedont use === because author.id is object and req.user._is is string*/
            else
            {
                req.flash("error", "You don't have permission to do that");
                res.redirect("back");
            }
        }
        });
    }
        else
        {
            req.flash("error", "You need to be logged in to do that");
            res.redirect("back");
        }
}




function editrights(req,res,next){
  if(req.isAuthenticated()){
    Comment.findById(req.params.commentId,function(err,comment){
        console.log(comment);
      if(comment.author.id.equals(req.user._id)){
        next();
      }
      else
      {
        req.flash("error", "You don't have permission to do that");
                res.redirect("back");
            }
    });
  }
  else
  {
    req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}



app.listen(3030, function(){
   console.log("The Tenovater Server Has Started! on port 3030");
});
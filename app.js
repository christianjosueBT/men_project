// LMFAO WHATalksndlkjansdjklaskld;jjas;kldjhas;odjhas;kldjhaso;kdj
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const CoffeeShop = require("./models/coffeeShop");
const User = require("./models/user");
const Review = require("./models/review");
const cache = require("./routeCache");
const session = require("express-session");
const passport = require('passport');
const localStrategy = require('passport-local');
const flash = require("connect-flash");
const multer = require("multer");
const { storage } = require("./cloudinary");
const upload = multer({ storage });
let allCoffeeShops = [];

mongoose
  .connect("mongodb://localhost: 27017/practice", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .catch(error => console.log(error));

const app = express();

// app.set('view engine', 'ejs');
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "thiscouldbebetter",
  })
);
app.use(flash());

// passport shit
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const findCoffeeShops = async () => {
  allCoffeeShops = await CoffeeShop.find({});
  return;
};
findCoffeeShops();

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.success = req.flash("success");
  res.locals.info = req.flash("info");
  res.locals.error = req.flash("error");
  res.locals.allCoffeeShops = allCoffeeShops;
  next();
});

// Use this middleware function to require being logged in
const requireLogin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash('error', 'you are not signed in');
    return res.redirect('/login');
  }
  next();
};

// Middleware that checks to see if current user has permission to do something
// NOTE: the if stamenent literally makes no sense (look into it when you can)
const isAllowed = async (req, res, next) => {
  const coffeeShop = await CoffeeShop.findById(req.params.id);
  if (req.session.user._id != coffeeShop.author)
    return res.redirect("/coffeeShops");
  next();
};

app.get("/", async (req, res) => {
  const coffeeShops = await CoffeeShop.find({}).limit(2);
  res.render("home.ejs", { coffeeShops });
});

// index page of coffeeshops (cached)
app.get("/coffeeShops", cache(300), async (req, res) => {
  // save all coffeeshops to a variable so they are quickly available (cached)
  let coffeeShops = [...res.locals.allCoffeeShops];

  // if there is a query this will run
  if (Object.keys(req.query).length !== 0) {
    // if there is a search query, filter coffeeshops by that search
    if (req.query.search) {
      coffeeShops = coffeeShops.filter(r =>
        r.name.toLowerCase().includes(req.query.search.toLowerCase())
      );
    }
    // if there ISN'T a count query and there are still more than 10 coffeeshops after filtering
    // reduce the size of coffeeshops to 10
    if (!req.query.count && coffeeShops.length > 10) {
      coffeeShops.length = 10;
    }
    // if there IS a count query and there are more than 10 coffeeshops in our variable
    // filter the relevant coffeeshops based on the value of count
    if (req.query.count && coffeeShops.length > 10) {
      const count = req.query.count * 10;
      coffeeShops = coffeeShops.slice(count, count + 10);
      res.send(coffeeShops);
      return;
    }
    res.render("coffeeShops/index.ejs", { coffeeShops });
    return;
  }
  // if there is no query in the url, only show the first 10 coffeeshops
  else {
    coffeeShops.length = 10;
    res.render("coffeeShops/index.ejs", { coffeeShops });
    return;
  }
});

// render 'make a new coffeeshop' form
app.get("/coffeeShops/new", requireLogin, (req, res) => {
  res.render("coffeeShops/new.ejs");
});

// add a new coffeeshop to the database
app.post(
  "/coffeeShops",
  requireLogin,
  upload.array("coffeeShop[images]"),
  async (req, res) => {
    // console.log(req.files);
    req.files.map(f => ({ url: f.path, filename: f.filename }));
    const coffeeShop = new CoffeeShop({
      author: req.session.user._id,
      name: req.body.coffeeShop.name,
      price: req.body.coffeeShop.price,
      description: req.body.coffeeShop.description,
    });
    await coffeeShop.save();
    res.redirect("/coffeeShops");
  }
);

app.get("/coffeeShops/:id", async (req, res) => {
  const coffeeShop = await CoffeeShop.findById(req.params.id).populate({
    path: "reviews",
    populate: { path: "author", select: "_id username profilePicture" },
  });
  let currentUser = {};
  if (!req.session.user) {
    currentUser = await User.findOne({ username: "idklol" });
  } else {
    currentUser = await User.findById(req.session.user._id);
  }
  res.render("coffeeShops/showPage.ejs", { coffeeShop, currentUser });
});

app.get("/coffeeShops/:id/edit", requireLogin, isAllowed, async (req, res) => {
  const coffeeShop = await CoffeeShop.findById(req.params.id);
  res.render("coffeeShops/edit.ejs", { coffeeShop });
});

app.put(
  "/coffeeShops/:id",
  requireLogin,
  isAllowed,
  upload.array("coffeeShop[images]"),
  async (req, res) => {
    const { id } = req.params;
    const coffeeShop = await CoffeeShop.findByIdAndUpdate(id, {
      ...req.body.coffeeShop,
    });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    coffeeShop.images.push(...imgs);
    await coffeeShop.save();
    res.redirect(`/coffeeShops/${coffeeShop._id}`);
  }
);

app.delete("/coffeeShops/:id", requireLogin, isAllowed, async (req, res) => {
  const { id } = req.params;
  const coffeeShop = await CoffeeShop.findByIdAndDelete(id);
  res.redirect("/coffeeShops");
});

app.post("/coffeeShops/:id/reviews", requireLogin, async (req, res) => {
  const coffeeshop = await CoffeeShop.findById(req.params.id);
  const review = new Review(req.body.review);
  coffeeshop.reviews.push(review);
  await review.save();
  await coffeeshop.save();
  res.redirect(`/coffeeShops/${coffeeshop._id}`);
});

app.get("/user/:id", async (req, res) => {
  const userProfile = await User.findById(req.params.id).populate("reviews");
  res.render("users/user.ejs", { userProfile });
});

app.get("/register", (req, res) => {
  res.render("users/register.ejs");
});

app.post("/register", async (req, res) => {
  try{
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register((user, password));
    req.session.user = user;
    req.flash('success', 'Successfully registered new account')
    res.redirect("/coffeeShops");
  } catch(e) {
    req.flash('error', e.message);
    res.redirect('/register')
  }
});

app.get("/login", (req, res) => {
  if (Object.keys(req.query).length !== 0) {
    res.send(res.locals.user);
  } else res.render("users/login.ejs");
});

app.post("/login", passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), async (req, res) => {
  req.flash('success', 'welcome back');
  res.redirect('/campgrounds');
});

app.post("/logout", (req, res) => {
  req.session.user = null;
  res.redirect("/coffeeShops");
});

app.post("/postman", async (req, res) => {
  const { body } = req;
  console.log(body);
  res.send(body);
});

app.listen(2000, () => {
  console.log(`Serving on port 2000`);
});

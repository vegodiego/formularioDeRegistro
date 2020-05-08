const express = require("express");
const cookieSession = require('cookie-session')
const mongoose = require("mongoose");


const app = express();

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/autenticacion', { useNewUrlParser: true });
const db = mongoose.connection;


const UserSchema = new mongoose.Schema({
  name: {
  	type: String,
  	unique: true,
  	required: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
}, { autoIndex: false });

var User = mongoose.model("User", UserSchema)

// hashes the password
UserSchema.pre("save", function (next) {
  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    this.password = hash;
    next();
  });
});

// used for authentication
UserSchema.statics.authenticate = async (email, password) => {
  const user = await mongoose.model("User").findOne({ email: email });
  if (user) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) reject(err);
        resolve(result === true ? user : null);
      });
    });
    return user;
  }

  return null;
};

app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({ secret: "session" }));

app.use("/public", express.static(process.cwd() + "/public"));

app.set("view engine", "ejs");



app.get("/", (req, res) => {
  User.find({}, function(err,users){
    res.render("index",{users:users});	
  })	
});

app.get("/register", (req, res) => {
  res.render("register");
})

app.post("/register", async (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  const data = {
  	name:name,
    email: email,
    password: password
  };

  try {
    const user = await User.create(data);
  } catch (e) {
    console.log(e);
  }
  res.redirect("/");
});









app.listen(3000, () => console.log('Listening on port 3000!'));



const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require("express-session")
const MongoDBStore = require('connect-mongodb-session')(session);
const PORT = 3000 || process.env.PORT
const errorController = require('./controllers/errorController');
const User = require('./models/userModel');
const MONGODB_URI = 'mongodb+srv://oluwamuyiwadosunmu:TKf5iCgZYN7n5i4K@cluster0.q6tfwsl.mongodb.net/shop';


const app = express();

const store = new MongoDBStore({
  uri: MONGODB_URI, // We could use diff implementations like Redis
  collection: 'sessions'
});



app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require("./routes/auth")

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret:',my-secret-key',
  resave:false, // improves performance
  saveUninitialized:false, // makes sure unnecessary are saved
  store:store
}))

app.use((req, res, next) => {
  if(!req.session.user) {
    return next()
  }
  User.findById(req.session.user._id) //We call a method to find user by the session
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

/**Routes */
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    MONGODB_URI,
    {useNewUrlParser: true,
    useUnifiedTopology: true,}
  )
  .then(result => {
    console.log('MongoDB Connected');
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'Muyiwa',
          email: 'muyiwa@test.com',
          cart: {
            items: []
          }
        });
        user.save();
      }
    });
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch(err => {
    console.log(err);
  });

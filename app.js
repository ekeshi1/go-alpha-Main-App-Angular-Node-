const express =  require("express");
const bodyParser = require("body-parser");
var cors = require('cors')
const sites = require("./apis/sites")
const app = express();
const dbHelper = require("./db/dbHelper");
const path = require("path");
const auth = require("./apis/users")
const passport = require('passport');

app.use(express.static(path.join( __dirname,"public")))
app.use(bodyParser.json());
app.use(cors())
app.use('/sites', sites);
app.use('/users', auth);
app.use(passport.initialize());
app.use(passport.session());
require('./utils/passport')(passport);


app.get('/',(req,res)=>{
    res.send("Invalid endpoint");
});

app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname, 'public/index.html'));
})
const PORT = process.env.PORT || 8080;
app.listen(PORT,() => console.log(`Server started on port ${PORT}`));

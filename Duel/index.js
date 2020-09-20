const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const listRoutes = require('./routes/List');


const url = 'mongodb://127.0.0.1:27017/duelists';
const PORT = process.env.PORT || 3000;


const app = express();
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
})

app.engine('hbs' , hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(express.urlencoded({extended: true}))
app.use(express.static(__dirname + '/front'))

app.use(listRoutes)

async function start(){
    try
    {
        await mongoose.connect(url , {
            useNewUrlParser: true,
            useFindAndModify: false
        })
        app.listen(PORT , () => console.log('Server is working ...'));

    } 
    catch(err) {
        console.log(err);
    }
};


start();
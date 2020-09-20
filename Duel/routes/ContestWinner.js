const {Router} = require('express');
const Duelist = require('../models/Duelist');
const mongoose = require('mongoose');



module.exports = async function(){
    const url = 'mongodb://127.0.0.1:27017/duelists';
    await mongoose.connect(url , {
        useNewUrlParser: true,
        useFindAndModify: false
    })

    let userArray = await Duelist.find({});
        let Winner = userArray[0];
        userArray.sort( (a, b) => {return b.Score - a.Score })
    return userArray
}
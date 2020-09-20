const {Schema, model} = require('mongoose');

const schema = new Schema({
    Score:{
        type: Number,
        default: 0
    },
    R_new1:{
        type: Number
    },
    R_new2:{
        type: Number
    },
    R_old1:{
        type: Number
    },



    Firstname:{
        type: String

    },
    Secondname:{
        type: String
    },
    Group:{
        type: String
    },
    Thirdname:{
        type: String
    },
    Password:{
        type: String
    },


    Request:{
        type: Boolean,
        default: false
    },

    isDueled:{
        type: Boolean,
        default: false
    },
    Opponent:{
        type: String
    },
    isAdmin:{
        type: Boolean
    }
    
})

module.exports = model('Duelist', schema);
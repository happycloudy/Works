const {Router} = require('express');
const Duelist = require('../models/Duelist');
const router = Router();
const setWinner = require('../routes/DuelWinner')
const getContestWinner = require('../routes/ContestWinner')
const mongoose = require("mongoose")

var isAuth = false;
var User = [];
var isDueled = false;


router.get('/', async (req, res) => {
    res.render('index' ,{
        title: 'Главная',
        isAuth,
        User
    });
})

router.get('/registration', (req,res) => {
    res.render('registration', {
        title: 'Регистрация',
        isAuth
    });
})

router.get('/enter', (req,res) => {
    res.render('enter', {
        title: 'Вход',
        isAuth
    });
})

router.get('/signout', (req,res) => {
    isAuth = false
    User = []
    res.redirect('/')
})


router.post('/registration', async (req,res) =>{
    let duelist = new Duelist({
        Firstname: req.body.Firstname,
        Secondname: req.body.Secondname,
        Thirdname: req.body.Thirdname,
        Group: req.body.Group,
        Password: req.body.Password
    }) ;

    await duelist.save()
    isAuth = true;
    User[0] = duelist
    res.redirect('/')
})


router.post('/enter', async (req,res) =>{
    let user = await Duelist.find({
        Firstname: req.body.Firstname,
        Secondname: req.body.Secondname,
        Password: req.body.Password
    });
    if(user.length == 1){
        isAuth = true;
        User = user;
        res.redirect('/');
    }else{
        console.log('Пользователь не найден');
        res.redirect('/enter');
    }
})

router.get('/students' , async (req,res) => {
    
    let user = User[0]
    Opponent = user.Opponent;
    let Duelists = await Duelist.find({_id: {$nin: [user._id , "5dc72d7c1af81424b45aa7da"] } });  

    
    let isRequested = user.Request  
    if(user.isDueled == false && user){
        res.render('students', {
            title: 'Противники',
            Duelists,
            isAuth,
            isRequested,
            Opponent
        })


    }else{
        res.render('index' ,{
            title: 'Главная',
            isAuth,
            User
        });
    }
    
})

router.post('/acceptRequest' , async (req,res) => {
    let user = User[0];

    let opponent = user.Opponent.split(' ');
    opponentFN = opponent[0];
    opponentSN = opponent[1];


    opponent = await Duelist.findOne({ Firstname : opponentFN , Secondname: opponentSN } );
    user.isDueled = true;
    opponent.Opponent = user.Firstname + ' ' + user.Secondname;
    opponent.isDueled = true;

    //-----Опционально
    opponent.Request = true;
    // ----

    await user.save();
    await opponent.save();
    res.redirect('/')
    
})

router.post('/offerToDuel' , async (req,res) => {
    let user = User[0];
    let opponent = await Duelist.findById(req.body.id);


    opponent.Request = true;
    opponent.Opponent = user.Firstname + ' ' + user.Secondname;


    await user.save();
    await opponent.save();
    
    setTimeout(()=> res.redirect('/') , 2000)
    
})


router.get('/participant' , async (req,res) => {
    let user = User[0]
    let Duelists = await Duelist.find({Request: true , isDueled: true});
    let isAdmin = user.isAdmin


    res.render('participant' ,{
        title: 'Список дуэлянтов',
        isAuth,
        isAdmin,
        Duelists
    });

    
})


router.post('/changescore' , async (req,res) => {
    let user = await Duelist.findById(req.body.id);

    let opponent = user.Opponent.split(' ');
    opponentFN = opponent[0];
    opponentSN = opponent[1];
    opponent = await Duelist.findOne({ Firstname : opponentFN , Secondname: opponentSN } );


    user.R_new1 = req.body.Rnew1 || user.R_new1
    user.R_new2 = req.body.Rnew2 || user.R_new2
    opponent.R_new1 = req.body.Rnew2 || user.R_new2
    user.R_old1 = req.body.Rold1 || user.R_old1

    uScore1 = Math.sqrt( (100 + user.R_new1 - user.R_new2) * Math.min(user.R_new1, user.R_new2) * ( (100 + user.R_new1 - user.R_old1) / 400) )
    user.Score = Math.round(uScore1)
    console.log(user.Firstname + " " + user.Secondname + ":" + uScore1)

    res.redirect('/participant')
    await user.save()
    await opponent.save()
})



router.get('/results' , async (req,res) => {
    let user = User[0]
    let isWinner
    let Winner
    
    WinnerArray = await getContestWinner()
    let ContestWinner = WinnerArray[0]
    // -- выводит с 0 очков
    let place2 = WinnerArray[1]
    let place3 = WinnerArray[2]



    if(user.Opponent){
        let opponent = user.Opponent.split(' ')
        
        opponentFN = opponent[0];
        opponentSN = opponent[1];
        opponent = await Duelist.findOne({ Firstname : opponentFN , Secondname: opponentSN } );
        Winner = setWinner(user, opponent);
        Winner = Winner.Firstname + " " + Winner.Secondname;
    
    }else{
        Winner = false
    }
    if(user.Score == 0 ){
        Winner = false
    }


    res.render('results' ,{
        title: 'Результаты',
        isAuth,
        Winner,
        isWinner,
        ContestWinner,
        place2,
        place3,
        layout: "result.hbs"
    });


    
})


router.post('/searchstud' , async (req,res) => {
    let user = User[0]

    let searchReq = req.body.name.split(' ');
    let firstname = searchReq[0]
    let secondname = searchReq[1]
    let isRequested = user.Request  

    let Duelists = await Duelist.find({Firstname: firstname , Secondname : secondname , _id: {$nin: user._id && "5dc72d7c1af81424b45aa7da"} });  

    
    res.render('students', {
        title: 'Противники',
        Duelists,
        isAuth,
        isRequested
    })

})


router.post('/searchpart' , async (req,res) => {
    let searchReq = req.body.name.split(' ');  // Разделение строки на 2 переменные
    let firstname = searchReq[0]
    let secondname = searchReq[1]

    let user = User[0]
    let Duelists = await Duelist.find({Request: true , isDueled: true , Firstname: firstname , Secondname: secondname});
    let isAdmin = user.isAdmin


    res.render('participant' ,{
        title: 'Список дуэлянтов',
        isAuth,
        isAdmin,
        Duelists
    });

})

router.post('/year2019' , async (req,res) => {
    res.redirect('/results')
})

router.post('/year2018' , async (req,res) => {
    WinnerArray = [
        {
            Firstname: "Иван",
            Secondname: "Иванов",
            Group: "С-10"
        },
        {
            Firstname: "Карина",
            Secondname: "Городова",
            Group: "ТМ-12"
        },
        {
            Firstname: "Олег",
            Secondname: "Валерьев",
            Group: "Н-15"
        }
    ]
    
    let ContestWinner = WinnerArray[0]
    let place2 = WinnerArray[1]
    let place3 = WinnerArray[2]

    res.render('results' ,{
        title: 'Результаты за 2019',
        isAuth,
        ContestWinner,
        place2,
        place3,
        layout: "result.hbs"
    });
})




module.exports = router


module.exports = function setWinner(score1, score2){
    let Winner;
    
    if(score1 > score2){
        Winner = score1
    }else{
        Winner = score2
    }
    return Winner
}



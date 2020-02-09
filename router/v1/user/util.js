
function calculateRating(review, rating, ratedRating){
    let ratingList = Array(0, 0, 0, 0, 0)
    if(review[0].review_detail){
        ratingList = review[0].review_detail.split(";")
        ratingList[rating] = parseInt(ratingList[rating].replace(',', '')) + 1
        ratingList[rating] = ratingList[rating].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        if(ratedRating > 0){
            ratingList[ratedRating] = parseInt(ratingList[ratedRating].replace(',', '')) - 1
            ratingList[ratedRating] = ratingList[ratedRating].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        }
    } else {
        ratingList[rating] = 1
    }
    return ratingList
}

module.exports = {
    calculateRating
}
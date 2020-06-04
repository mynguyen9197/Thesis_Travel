
function calculateRating(review, rating, ratedRating){
    let ratingList = Array(0, 0, 0, 0, 0)
    let averageRating = 0
    if(review[0].review_detail){
        ratingList = review[0].review_detail.split(";")
        ratingList[rating] = parseInt(ratingList[rating].replace(',', '')) + 1
        ratingList[rating] = ratingList[rating].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        if(ratedRating >= 0){
            ratingList[ratedRating] = parseInt(ratingList[ratedRating].replace(',', '')) - 1
            ratingList[ratedRating] = ratingList[ratedRating].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        }
    } else {
        ratingList[rating] = 1
    }
    let countRate = 0
    ratingList = ratingList.map(function(item) {
        countRate += parseInt(item, 10)
        return parseInt(item, 10)
    })
    const total = ratingList[0]*5 + ratingList[1]*4 + ratingList[2]*3 + ratingList[3]*2 + ratingList[4]
    averageRating = Math.round(total/countRate)
    ratingListAsString = ratingList.join(';')
    return {ratingListAsString, averageRating}
}

function calculateAverageRating(list_of_rating){
    return list_of_rating.reduce((a, b) => a + b) / list_of_rating.length
}

module.exports = {
    calculateRating, calculateAverageRating
}
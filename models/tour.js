const { load, save } = require(global.appRoot + '/models/db-access')

const insertTour = async(tour) => {
    const sql = `insert into tour(name, rating, review, price, overview, hightlight, wtd, important_info, additional, cancel_policy, review_detail, key_detail, advantage) 
    values('${tour.name}', ${tour.rating}, ${tour.review}, ${tour.price}, '${tour.overview}', '${tour.highlight}', '${tour.wtd}', '${tour.important_info}', '${tour.additional}', '${tour.cancel_policy}', '${tour.review_detail}', '${tour.review_detail}', '${tour.advantage}');`;
    return save(sql)
}

const insertTourKind = async(tourid, kind_id) => {
    const sql = `insert into tour_kind(tour_id, kind_id) values(${tourid}, ${kind_id});`
    return save(sql)
}

const insertTourism = async(tourism) => {
    const sql = `insert into tourism(name, link) values('${tourism.name}, ${tourism.link})`
    return save(sql)
}

const insertComment = ((comment, tourid) => {
    const sql = `insert into comments(quote, content, tour_id) values('${comment.quote}', '${comment.content}', ${tourid});`;
    return save(sql)
})

module.exports = {
    insertTour, insertTourKind
}
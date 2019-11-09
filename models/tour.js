const { load, save } = require(global.appRoot + '/models/db-access')

const insertTour = async(tour, tourism) => {
    const sql = `insert into tour(name, rating, review, price, overview, highlight, wtd, important_info, additional, cancel_policy, key_detail, advantage, thumbnail, tourism_id) 
    values('${tour.name}', ${tour.rating}, ${tour.review}, ${tour.price}, '${tour.overview}', '${tour.highlight}', '${tour.wtd}', '${tour.important_info}', '${tour.additional}', '${tour.cancel_policy}', '${tour.key_detail}', '${tour.advantage}', '${tour.thumbnail}', ${tourism});`;
    return save(sql)
}

const insertTourism = async(tourism_name) => {
    const sql = `insert into tourism(name) values('${tourism_name}')`
    return save(sql)
}

const insertComment = async(comment, tourid, userid) => {
    const sql = `insert into comments(quote, content, tour_id, user_id) values('${comment.quote}', '${comment.content}', ${tourid}, ${userid});`;
    return save(sql)
}

const insertImage = async(image, tour) => {
    const sql = `insert into images(address, tour_id) values('${image}', ${tour});`;
    return save(sql)
}

const loadAllTours = () => {
    const sql = `select name from tour ORDER BY id ASC;`
    return load(sql)
}

const loadAllTourism = () => {
    const sql = `select name from tourism ORDER BY id ASC;`
    return load(sql)
}

const findTourByName = async(name) => {
    const sql = `select id from tour where name='${name}';`
    return load(sql)
}

const findTourismByName = async(name) => {
    const sql = `select id from tourism where name='${name}';`
    return load(sql)
}

const findTourismById = async(tourism_id) => {
    const sql = `select * from tourism where id=${tourism_id};`
    return load(sql)
}

const loadTourByActivityId = async(act_ids) => {
    const query = `SELECT DISTINCT t.id, t.name, t.thumbnail, t.rating, t.price, t.review FROM tour t, activity_tour at WHERE t.id=at.tour_id and at.activity_id in (${act_ids}) ORDER BY rating DESC, 
    review DESC;`
    return load(query)
}

const loadAllTourActivities = ((cat_id) => {
    const query = `SELECT * FROM activity_of_tour;`
    return load(query)
})

const findTourById = (id) => {
    const sql = `select * from tour where id=${id};`
    return load(sql)
}

const loadImagesByTourId = ((tour_id) => {
    const sql = `select * from images i where i.tour_id=${tour_id};`
    return load(sql)
})

const loadCommentsByTourId = ((tour_id) => {
    const sql = `select * from Comments c where c.tour_id=${tour_id};`
    return load(sql)
})

const updateReview = ((review, tour_id) => {
    const query =  `update place set review_detail='${review}' where id=${tour_id};`
    return save(query)
})

module.exports = {
    insertTour, insertTourism,
    insertComment, loadAllTourism, insertImage,
    loadAllTours, findTourByName, findTourismByName,
    loadTourByActivityId, findTourById,
    loadImagesByTourId, loadCommentsByTourId,
    findTourismById, updateReview, loadAllTourActivities
}
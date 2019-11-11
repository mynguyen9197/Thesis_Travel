const { load, save } = require(global.appRoot + '/models/db-access')

const insertPlace = (async(place) => {
    const sql = `insert into place(name, about, thumbnail, rating, review, ranking, open_hour, duration, review_detail) 
    values('${place.name}', '${place.about}', '${place.thumbnail}', ${place.rating}, ${place.review}, '${place.ranking}', '${place.open_hour}', '${place.duration}', '${place.review_detail}');`;
    return save(sql)
})

const insertImage = ((image, place) => {
    const sql = `insert into images(address, place_id) values('${image}', ${place});`;
    return save(sql)
})

const insertContact = (contact => {
    const sql = `insert into contact(phone, address, place_id) values('${contact.phone}', '${contact.address}', ${contact.place_id});`;
    return save(sql)
})

const insertComment = ((comment, place_id, user_id) => {
    const sql = `insert into comments(quote, content, place_id, user_id) values('${comment.quote}', '${comment.content}', ${place_id}, ${user_id});`;
    return save(sql)
})

const insertActivityPlace = ((activity_id, place_id) => {
    const sql = `insert into activity_place(activity_id, place_id) values(${activity_id}, ${place_id});`;
    return save(sql)
})

const loadAllActivities = (() => {
    const sql = `select name from activity`
    return load(sql)
})

const loadDetailById = ((placeid) => {
    const sql = `select * from place p where p.id=${placeid};`
    return load(sql)
})

const loadImagesByPlaceId = ((placeid) => {
    const sql = `select * from images i where i.place_id=${placeid};`
    return load(sql)
})

const loadContactByPlaceId = ((placeid) => {
    const sql = `select * from contact c where c.place_id=${placeid};`
    return load(sql)
})

const loadCommentsByPlaceId = ((placeid) => {
    const sql = `select * from Comments c where c.place_id=${placeid};`
    return load(sql)
})

const loadReviewByPlaceId = ((placeid) => {
    const sql = `select * from review_detail r where r.place_id=${placeid};`
    return load(sql)
})

const loadTop20ByRating = (() => {
    const query = 'SELECT id, name, thumbnail, rating, ranking, review FROM place ORDER BY rating DESC, ranking DESC, review DESC LIMIT 20;'
    return load(query)
})  

const loadAllCategories = (() => {
    const query = 'SELECT * FROM place_category;'
    return load(query)
})

const loadActivitiesByCategoryId = ((cat_id) => {
    const query = `SELECT * FROM activity_of_place WHERE category=${cat_id};`
    return load(query)
})

const loadPlacesByActivityId = async(act_ids) => {
    const query = `SELECT DISTINCT p.id, p.name, p.thumbnail, p.rating, p.ranking, p.review FROM place p, activity_place ap WHERE p.id=ap.place_id and ap.activity_id in (${act_ids}) ORDER BY rating DESC, 
    ranking DESC, review DESC;`
    return load(query)
}

const findPlaceByName = (name => {
    const query =  `SELECT id, name, thumbnail, rating, ranking, review FROM place WHERE name like '${name}' ORDER BY rating DESC, ranking DESC, review DESC; `
    return load(query)
})

const findPlaceByNameAndActivity = ((name, act_ids) => {
    const query = `SELECT DISTINCT p.id, p.name, p.thumbnail, p.rating, p.ranking, p.review FROM place p, activity_place ap
    WHERE p.id=ap.place_id and ap.activity_id in (${act_ids}) and p.name like '${name}' ORDER BY rating DESC, 
    ranking DESC, review DESC;`
    return load(query)
})

const updateReview = ((review, placeid) => {
    const query =  `update place set review_detail='${review}' where id=${placeid};`
    return save(query)
})

module.exports = {
    insertPlace,
    insertImage,
    insertContact,   
    insertComment,
    insertActivityPlace,
    loadAllActivities,
    loadDetailById,
    loadImagesByPlaceId,
    loadContactByPlaceId,
    loadCommentsByPlaceId,
    loadReviewByPlaceId,
    loadTop20ByRating,
    loadAllCategories,
    loadActivitiesByCategoryId,
    loadPlacesByActivityId,
    findPlaceByName,
    findPlaceByNameAndActivity,
    updateReview
}
const { load, save } = require(global.appRoot + '/models/db-access')

const insertPlace = (async(place) => {
    const sql = `insert into place(name, about, thumbnail, rating, review, ranking, duration, review_detail, address, phone) 
    values('${place.name}', '${place.about}', '${place.thumbnail}', ${place.rating}, ${place.review}, '${place.ranking}', '${place.duration}', '${place.review_detail}', '${place.address}', '${place.phone}');`;
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
    const sql = `select name from activity_of_place`
    return load(sql)
})

const loadAllIdAndNamePlaces = (() => {
    const sql = `select id, name as content from place`
    return load(sql)
})

const loadAllIdAndAboutPlaces = (async() => {
    const sql = `select id, about as content from place`
    return load(sql)
})

const loadAllIdNameAndAboutPlaces = (async() => {
    const sql = `select id, about, name from place`
    return load(sql)
})

const loadIdAndNamePlaceById = ((id) => {
    const sql = `select id, name as content from place where id=${id}`
    return load(sql)
})

const loadByName = ((name) => {
    const sql = `select id, name from place where name='${name}';`
    return load(sql)
})

const loadDetailById = ((placeid) => {
    const sql = `select * from place p where p.id=${placeid};`
    return load(sql)
})

const loadImagesByPlaceId = ((placeid) => {
    const sql = `select * from images i where i.place_id=${placeid} order by i.id DESC;`
    return load(sql)
})

const loadContactByPlaceId = ((placeid) => {
    const sql = `select * from contact c where c.place_id=${placeid};`
    return load(sql)
})

const loadCommentsByPlaceId = ((placeid) => {
    const sql = `select c.*, u.username from comments c, user u where c.place_id=${placeid} and u.id=c.user_id order by c.id DESC;`
    return load(sql)
})

const loadReviewByPlaceId = ((placeid) => {
    const sql = `select review_detail from place p where p.id=${placeid};`
    return load(sql)
})

const loadTop20ByRating = (() => {
    const query = 'SELECT id, name, thumbnail, rating, ranking, review FROM place ORDER BY rating DESC, ranking DESC, review DESC LIMIT 20;'
    return load(query)
})  

const loadAllPlaces = (() => {
    const query = 'SELECT id, name, thumbnail, rating, ranking, review FROM place;'
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

const loadActivityByName = ((name) => {
    const query = `SELECT * FROM activity_of_place WHERE name='${name}';`
    return load(query)
})

const loadPlacesByActivityId = async(act_ids) => {
    const query = `SELECT DISTINCT p.id, p.name, p.thumbnail, p.rating, p.ranking, p.review FROM place p, activity_place ap WHERE p.id=ap.place_id and ap.activity_id in (${act_ids}) ORDER BY rating DESC, 
    ranking DESC, review DESC;`
    return load(query)
}

const loadPlacesByPlaceIds = async(place_ids) => {
    const query = `SELECT DISTINCT p.id, p.name, p.thumbnail, p.rating, p.ranking, p.review FROM place p WHERE p.id in (${place_ids}) ORDER BY rating DESC, 
    ranking DESC, review DESC;`
    return load(query)
}

const findPlacesById = async(place_ids) => {
    const query = `SELECT * FROM place WHERE id in (${place_ids}) ORDER BY rating DESC, 
    ranking DESC, review DESC;`
    return load(query)
}

const findPlaceByName = (name => {
    const query =  `SELECT id, name, thumbnail, rating, ranking, review FROM place WHERE LOWER(name) like LOWER('%${name}%') ORDER BY rating DESC, ranking DESC, review DESC; `
    return load(query)
})

const findRatedPlaceByUser = async(userid) => {
    const query =  `SELECT * FROM rating_place WHERE user_id=${userid} ORDER BY id DESC; `
    return load(query)
}

const findPlaceByNameAndActivity = ((name, act_ids) => {
    const query = `SELECT DISTINCT p.id, p.name, p.thumbnail, p.rating, p.ranking, p.review FROM place p, activity_place ap
    WHERE p.id=ap.place_id and ap.activity_id in (${act_ids}) and LOWER(p.name) like LOWER('%${name}%') ORDER BY rating DESC, 
    ranking DESC, review DESC;`
    return load(query)
})

const updateReview = ((review, placeid) => {
    const query =  `update place set review_detail='${review}' where id=${placeid};`
    return save(query)
})

const checkIfUserAlreadyReview = ((placeid, user_id) => {
    const query = `select * from rating_place where place_id=${placeid} and user_id=${user_id};`
    return load(query)
})

const updateRating = ((info) => {
    const query = `update rating_place set rating = ${info.rating} where place_id=${info.place_id} and user_id=${info.user_id};`;
    return save(query)
})

const insertRating = ((info) => {
    const query = `insert into rating_place(rating, place_id, user_id) values(${info.rating}, ${info.place_id}, ${info.user_id});`;
    return save(query)
})

const insertUserLog = async(placeid, userid, last_update) => {
    const sql = `insert into place_user_log (place_id, user_id, times, last_update) values(${placeid}, ${userid}, 1, '${last_update}');`
    return save(sql)
}

const updateUserLog = async(placeid, userid, times, last_update) => {
    const sql = `update place_user_log set place_id=${placeid}, user_id=${userid}, times=${times}, last_update='${last_update}';`
    return save(sql)
}

const findUserLog = async(placeid, userid) => {
    const sql = `select * from place_user_log where place_id=${placeid} and user_id=${userid};`
    return load(sql)
}

const findOtherPlaceInGroup = async(placeid) => {
    const sql = `SELECT DISTINCT p.id as id, p.name as content from place p, activity_place ap WHERE p.id=ap.place_id and ap.activity_id in 
    (SELECT activity_id FROM activity_place WHERE place_id=${placeid});`
    return load(sql)
}

const updatePlace = (async(place) => {
    const sql = `update place set name='${place.name}', about='${place.about}', thumbnail='${place.thumbnail}', rating=${place.rating},
     review=${place.review}, ranking='${place.ranking}', duration='${place.duration}', review_detail='${place.review_detail}', 
     address='${place.address}', phone='${place.phone}' where id=${place.id};`
    return save(sql)
})

module.exports = {
    insertPlace, insertImage,
    insertContact, insertComment,
    insertActivityPlace, loadAllActivities,
    loadDetailById, loadImagesByPlaceId,
    loadContactByPlaceId, loadCommentsByPlaceId,
    loadReviewByPlaceId, loadTop20ByRating,
    loadAllCategories, loadActivitiesByCategoryId,
    loadPlacesByActivityId, findPlaceByName,
    findPlaceByNameAndActivity, updateReview, 
    loadAllIdAndNamePlaces, findPlacesById,
    loadActivityByName, loadByName,
    checkIfUserAlreadyReview, updateRating,
    insertRating, loadAllIdAndAboutPlaces,
    loadIdAndNamePlaceById, findRatedPlaceByUser,
    loadPlacesByPlaceIds, insertUserLog,
    updateUserLog, findUserLog,
    findOtherPlaceInGroup, loadAllIdNameAndAboutPlaces,
    updatePlace, loadAllPlaces
}
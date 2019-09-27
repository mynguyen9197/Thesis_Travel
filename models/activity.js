const { load, save } = require(global.appRoot + '/models/db-access')

const insertPlace = (async(place) => {
    const sql = `insert into place(name, about, thumbnail, rating, review, ranking, open_hour, duration) 
    values('${place.name}', '${place.about}', '${place.thumbnail}', ${place.rating}, ${place.review}, '${place.ranking}', '${place.open_hour}', '${place.duration}');`;
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

const insertComment = ((comment, place_id) => {
    const sql = `insert into comments(quote, content, place_id) values('${comment.quote}', '${comment.content}', ${place_id});`;
    return save(sql)
})

const insertReview = ((review, place_id) => {
    const sql = `insert into review_detail(level, place_id) values('${review}', ${place_id});`;
    return save(sql)
})

const insertActivityPlace = ((activity_id, place_id) => {
    const sql = `insert into activity_place(activity_id, place_id) values(${activity_id}, ${place_id});`;
    return save(sql)
})

const loadAllKinds = (() => {
    const sql = `select name from kind_of_activity`
    return load(sql)
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

const loadKindOfActivityOfPlace = ((placeid) => {
    const sql = `select ap.*, k.name as kind_of_activity from place p, activity_place ap, kind_of_activity k where p.id = ${placeid} and p.id=ap.place_id and k.id=ap.activity_id;`
    return load(sql)
})

module.exports = {
    insertPlace: insertPlace,
    insertImage: insertImage,
    insertContact: insertContact,
    insertComment: insertComment,
    insertReview: insertReview,
    insertActivityPlace: insertActivityPlace,
    loadAllKinds: loadAllKinds,
    loadAllActivities: loadAllActivities,
    loadDetailById: loadDetailById,
    loadKindOfActivityOfPlace: loadKindOfActivityOfPlace,
    loadImagesByPlaceId: loadImagesByPlaceId,
    loadContactByPlaceId: loadContactByPlaceId,
    loadCommentsByPlaceId: loadCommentsByPlaceId,
    loadReviewByPlaceId: loadReviewByPlaceId
}
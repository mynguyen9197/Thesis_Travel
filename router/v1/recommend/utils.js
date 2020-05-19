const axios = require('axios')

const backend_server = 'https://hoian-travel.herokuapp.com/'
const recommend_server = 'http://recommender-travel-app.herokuapp.com/'
const backend_local = 'http://localhost:5000/'
const recommend_local = 'http://localhost:8080/'

const requestToRecommenderApi = async(request_url, extra_route, user_id) => {
    if (request_url.startsWith(backend_local)){
        return await axios.get(recommend_local + extra_route + user_id).then(res => {
            return res.data
        }).catch(error => {
            console.log(error)
            throw new Error("Error");
        })
    } else if(request_url.startsWith(backend_server)){
        return await axios.get(recommend_server + extra_route + user_id).then(res => {
            return res.data
        }).catch(error => {
            console.log(error)
            throw new Error("Error");
        })
    }
}

module.exports = {
    requestToRecommenderApi
}
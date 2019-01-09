const path = require('path')
const NeDB = require('nedb')

// Connect DB //
const userDB = new NeDB({
    filename: path.join(__dirname, 'user.db'),
    autoload: true
})

const timelineDB = new NeDB({
    filename: path.join(__dirname, 'timeline.db'),
    autoload: true
})

// Get Hash for password //
function getHash (pw) {
    const salt    = '::EVuCM0QwfI48Krpr'
    const crypto  = require('crypto')
    const hashsum = crypto.createHash('sha512')

    hashsum.update(pw + salt)
    return hashsum.digest('hex')
}
// Create token for authentication //
function getAuthToken (userid) {
    const time = (new Date()).getTime()
    return getHash(`${userid}:${time}`)
}

// Methods for management DB //
// Search user
function getUser (userid, callback) {
    userDB.findOne({userid}, (err, user) => {
        if (err || user === null) return callback(null)
        callback(user)
    })
}

// Add User
function addUser (userid, passwd, callback) {
    const hash   = getHash(passwd)
    const token  = getAuthToken(userid)
    const regDoc = {userid, hash, token, friends: {}}
    userDB.insert(regDoc, (err, newdoc) => {
        if (err) return callback(null)
        callback(token)
    })
}
// Judge user id & password is valid
function login (userid, passwd, callback) {
    const hash  = getHash(passwd)
    const token = getAuthToken(userid)
    // Get User information
    getUser(userid, (user) => {
        if (!user || user.hash !== hash) {
            return callback(new Error('認証エラー'), null)
        }
        // Update token
        user.token = token
        updateUser(user, (err) => {
            if (err) return callback(err, null)
            callback(null, token)
        })
    })
}

// Check token
function checkToken (userid, token, callback) {
    // Get User Information
    getUser(userid, (user) => {
        if (!user || user.token !== token) {
            return callback(new Error('認証に失敗'), null)
        }
        callback(null, user)
    })
}

// Update User information
function updateUser (user, callback) {
    userDB.update({userid: user.userid}, user, {}, (err, n) => {
        if (err) return callback(err, null)
        callback(null)
    })
}

// Get Friends Timeline Comments
function getFriendsTimeline (userid, token, callback) {
    checkToken(userid, token, (err, user) => {
        if (err) return callback(new Error('認証に失敗'), null)
        // Get the list of following friends
        const friends = []
        // Show Following Friends comments
        for (const f in user.friends) friends.push(f)
        // Show Login Users comments
        friends.push(userid)

        // Get Comments upto 20
        timelineDB
            .find({userid: {$in: friends}})
            .sort({time: -1})
            .limit(20)
            .exec((err, docs) => {
                if (err) {
                    callback(new Error('DBエラー'), null)
                    return
                }
                callback(null, docs)
            })
    })
}

module.exports = {
    userDB, timelineDB, getUser, addUser, login, checkToken, updateUser, getFriendsTimeline
}

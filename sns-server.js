// Connect db //
const db = require('./server/database')

// Server config //
const express = require('express')
const app         = express()
const portNo    = 3001
app.listen(portNo, () => {
    console.log('Please Open URL:', `http://localhost:${portNo}`)
})

// API //
// Add User
app.get('/api/adduser', (req, res) => {
    const userid = req.query.userid
    const passwd    = req.query.passwd
    if (userid === '' || passwd === '') {
        return res.json({status: false, msg: 'パラメータが空'})
    }
    // Check Users
    db.getUser(userid, (user) => {
        if (user) { // If UserID is already used
            return res.json({status: false, msg: '既にユーザがいます'})
        }
        // Create User
        db.addUser(userid, passwd, (token) => {
            if (!token) {
                res.json({status: false, msg: 'DBのエラー'})
            }
            res.json({status: true, token})
        })
    })
})

// Login API (Return token)
app.get('/api/login', (req, res) => {
    const userid = req.query.userid
    const passwd = req.query.passwd
    db.login(userid, passwd, (err, token) => {
        if (err) {
            res.json({status: false, msg: '認証エラー'})
            return
        }
        // return token if success
        res.json({status: true, token})
    })
})

// Add Friend
app.get('/api/add_friend', (req, res) => {
    const userid = req.query.userid
    const token = req.query.token
    const friendid = req.query.friendid
    db.checkToken(userid, token, (err, user) => {
        if (err) { // Auth error
            res.json({status: false, msg: '認証エラー'})
            return
        }
        // Add friends
        user.friends[friendid] = true
        db.updateUser(user, (err) => {
            if (err) {
                res.json({status: false, msg: 'DBエラー'})
                return
            }
            res.json({status: true})
        })
    })
})

// Add comments to timeline
app.get('/api/add_timeline', (req, res) => {
    const userid = req.query.userid
    const token = req.query.token
    const comment = req.query.comment
    const time = (new Date()).getTime()
    db.checkToken(userid, token, (err, user) => {
        if (err) {
            res.json({status: false, msg: '認証エラー'})
            return
        }
        // Add comment
        const item = {userid, comment, time}
        db.timelineDB.insert(item, (err, it) => {
            if (err) {
                res.json({status: false, msg: 'DBエラー'})
                return
            }
            res.json({status: true, timelineid: it._id})
        })
    })
})

// Get the list of all users
app.get('/api/get_allusers', (req, res) => {
    db.userDB.find({}, (err, docs) => {
        if (err) return res.json({status: false})
        const users = docs.map(e => e.userid)
        res.json({status: true, users})
    })
})

// Get User information
app.get('/api/get_user', (req, res) => {
    const userid = req.query.userid
    db.getUser(userid, (user) => {
        if (!user) return res.json({status: false})
        res.json({status: true, friends: user.friends})
    })
})

// Get friends timeline
app.get('/api/get_friends_timeline', (req, res) => {
    const userid = req.query.userid
    const token = req.query.token
    db.getFriendsTimeline(userid, token, (err, docs) => {
        if (err) {
            res.json({status: false, msg: err.toString()})
            return
        }
        res.json({status: true, timelines: docs})
    })
})

// Routing
app.use('/public', express.static('./public'))
app.use('/signin', express.static('./public'))
app.use('/login', express.static('./public'))
app.use('/users', express.static('./public'))
app.use('/timeline', express.static('./public'))
app.use('/', express.static('./public'))

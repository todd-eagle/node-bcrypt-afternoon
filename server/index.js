require('dotenv').config()
const express = require('express')
const app = express()
const massive = require('massive')
const session = require('express-session')
const {SERVER_PORT, CONNECTION_STRING, SESSION_SECRET} = process.env
const authCtrl = require('./controllers/authController')
const treasureCtrl = require('./controllers/treasureController')
const authMidCtrl = require('./middleware/authMiddleware')

app.use(express.json())

app.use(
    session({
        resave: true,
        saveUninitialized: false,
        secret: SESSION_SECRET
    })
)

massive({
    connectionString: CONNECTION_STRING,
    ssl: {rejectUnauthorized: false}
}).then(db =>{
    app.set('db', db)
    console.log('db connected')
    app.listen(SERVER_PORT, ()=>console.log(`Sever up and listening on port: ${SERVER_PORT}`))
})


app.post('/auth/register', authCtrl.register)
app.post('/auth/login', authCtrl.login)
app.get('/auth/logout', authCtrl.logout)

app.get('/api/treasure/dragon', treasureCtrl.dragonTreasure)
app.get('/api/treasure/user', authMidCtrl.usersOnly, treasureCtrl.getUserTreasure)
app.post('/api/treasure/user', authMidCtrl.usersOnly, treasureCtrl.addUserTreasure)
app.get('/api/treasure/all',  authMidCtrl.usersOnly, authMidCtrl.adminsOnly,  treasureCtrl.getAllTreasure)
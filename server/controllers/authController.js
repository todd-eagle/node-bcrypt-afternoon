const bcrypt = require('bcryptjs')

module.exports = {
    register: async(req, res) =>{
        const {username, password, isAdmin} = req.body
        const db = req.app.get('db')

        const result = await db.get_user(username)
        const existingUser = result

        if (existingUser[0]) {
            return res.status(409).send('Username is taken')
        }
        const salt = bcrypt.genSaltSync(10)
        const hash =bcrypt.hashSync(password, salt)

        const registeredUser = await db.register_user([isAdmin, username, hash])
        const user = registeredUser[0]

        req.session.user = {
            isAdmin: user.is_admin,
            id: user.id,
            username: user.username
        }

        res.status(201).send(req.session.user)
    },
    login: async(req, res) => {
       const {username, password} = req.body 
       const db = req.app.get('db')

       const foundUser =  await db.get_user(username)
       const user = foundUser[0]

       if(!user) {
           return res.status(401).send('User not found')
       }

       const isAuthenticated = bcrypt.compareSync(password, user.hash)
       if (!isAuthenticated){
           return res.status(403).send('Incorrect password')
       }
       req.session.user = {
            isAdmin: user.is_admin,
            id: user.id,
            username: user.username
       }
       return res.send(req.session.user)
    },
    logout: async(req, res) => {
        req.session.destroy()
        return res.sendStatus(200)
    },
}
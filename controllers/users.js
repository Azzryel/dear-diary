const bcrypt = require("bcrypt")
const usersRouter = require("express").Router()
const db = require("../config/config")

const { body, validationResult } = require("express-validator")

const jwt = require("jsonwebtoken")
const getTokenFrom = require("../utils/getTokenFrom")

usersRouter.post("/",

    body("username", "Username needs to be at least 3char long").trim().isLength({ min: 3 }).escape(),
    body("password", "Password needs to be at least 3char long").trim().isLength({ min: 3 }).escape(),

    async (req, res) => {

        const { username, password } = req.body

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
        }

        const saltRounds = 10
        const passwordHash = await bcrypt.hash(password, saltRounds)

        const sqlGetUser = 'SELECT count(*) FROM Users WHERE username = ?;'
        const sqlInsertUser = 'INSERT INTO Users (username, password) VALUES (?, ?);'


            db.query(sqlGetUser, [username], (err, result) => {
                if (err) return res.status(500).json( err )

                const userCount = result[0]["count(*)"]

                if(userCount > 0) {
                    return res.status(400).json({ message: "Username already taken" })
                }
                else {

                    db.query(sqlInsertUser, [username, passwordHash], (err, result) => {
                        if (err) return res.status(500).json( err )

                        return res.json({ message: "User created" })
                    })

                }
            })
})

usersRouter.delete("/:user", async (req, res) => {

    const user = req.params.user

    const token = getTokenFrom(req)

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if(err) {
            return res.status(401).json({ message: err })
        }

        const sql = 'DELETE FROM Users WHERE username = ? ;'

        db.query(sql, [ user ], (err, result) => {
            if (err) return res.status(500).json( err )

            return res.json({ message: "User deleted" })
        })

    })
})

module.exports = usersRouter
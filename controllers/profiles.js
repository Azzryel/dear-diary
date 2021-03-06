const jwt = require("jsonwebtoken")
const profilesRouter = require("express").Router()
const db = require("../config/config")

const { body, validationResult } = require("express-validator")

const getTokenFrom = require("../utils/getTokenFrom")

profilesRouter.get("/", async (req, res) =>  {
    const token = getTokenFrom(req)

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if(err) {
            return res.status(401).json({ message: err })
        }

        const user = decodedToken
        const sql = 'SELECT * FROM Profiles WHERE userID = ? ;'

        db.query(sql, [user.id ], (err, result) => {
            if (err) return res.status(500).json( err )

            return res.status(200).json(result)
        })

    })

})



profilesRouter.post("/",

    body("name", "Min length 3").trim().isLength({ min: 3 }).escape().optional({ nullable: true }),
    body("surname", "Min length 3").trim().isLength({ min: 3 }).escape().optional({ nullable: true }),
    body("country", "Min length 3").trim().isLength({ min: 3 }).escape().optional({ nullable: true }),
    body("city", "Min length 3").trim().isLength({ min: 3 }).escape().optional({ nullable: true }),
    body("birthday", "Date needs to be a valid date of YYYY-MM-DD format").trim().isDate({ format: "YYYY-MM-DD" }).optional({ nullable: true }),

    async (req, res) =>  {
        const { name, surname, country, city, birthday } = req.body

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
        }

        const token = getTokenFrom(req)

        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if(err) {
                return res.status(401).json({ message: err })
            }

            const user = decodedToken
            const sql = 'INSERT INTO Profiles (userID, name, surname, country, city, birthday) VALUES (?, ?, ?, ?, ?, ?);'

            db.query(sql, [user.id, name, surname, country, city, birthday  ], (err, result) => {
                if (err) return res.status(500).json( err )

                return res.json({ message: "Profile posted" })
            })
        })
})

profilesRouter.put("/:id",

    body("name", "Min length 3").trim().isLength({ min: 3 }).escape().optional({ nullable: true }),
    body("surname", "Min length 3").trim().isLength({ min: 3 }).escape().optional({ nullable: true }),
    body("country", "Min length 3").trim().isLength({ min: 3 }).escape().optional({ nullable: true }),
    body("city", "Min length 3").trim().isLength({ min: 3 }).escape().optional({ nullable: true }),
    body("birthday", "Date needs to be a valid date of YYYY-MM-DD format").trim().isDate({ format: "YYYY-MM-DD" }).optional({ nullable: true }),

    async (req, res) =>  {
        const { name, surname, country, city, birthday } = req.body
        const userID = req.params.id


        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const token = getTokenFrom(req)

        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if(err) {
                return res.status(401).json({ message: err })
            }

            const sql = 'UPDATE Profiles SET name = ?, surname = ?, country = ?, city = ?, birthday = ? WHERE userID = ? ;'

            db.query(sql, [name, surname, country, city, birthday, userID  ], (err, result) => {
                if (err) return res.status(500).json( err )

                return res.json({ message: "Profile updated" })
            })
        })
})

module.exports = profilesRouter
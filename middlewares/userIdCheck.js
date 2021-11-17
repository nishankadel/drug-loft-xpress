const connection = require('../db/connection');

exports.userIdCheck =  (req, res, next) => {
    try {
        const token = await req.header('Authorization').replace('Bearer ', '')
        const data = await jwt.verify(token, process.env.JWT_KEY)
        const user = await User.findOne({ _id: data._id, 'tokens.token': token })
        req.user = user
        next()
    }
    catch (e) {
        res.status(401).json({ error: 'Not authorized to access this resource' })
    }
}
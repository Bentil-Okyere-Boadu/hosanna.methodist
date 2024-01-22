const http = require('http')
const express = require("express")
const app = express()
const dotenv = require('dotenv')
const cors = require('cors')
const server = http.createServer(app)
const connectDB = require('./config/db')
const userRoutes = require("./routes/userRoutes")
const { notFound, errorHandler } = require('./middleware/errorMiddleware')
const morgan = require('morgan');

app.use(morgan('dev'))
app.use(cors())
app.use(express.json()) //for the server to accept JSON data
dotenv.config({ path:'.env'})

//connecting database
connectDB()

/**getting routes */
app.use('/api/user', userRoutes);


/**Handle error */
// app.use(notFound)
// app.use(errorHandler)

 
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.NODE_ENV === 'production'? process.env.PRODUCTION_URL : process.env.DEV_SERVER
const service = server.listen( PORT, ()=> {
    console.log(`Server started on port ${PORT}`)
})

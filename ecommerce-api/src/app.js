const express = require('express');
const session = require('express-session');
const errorHandler = require('./middlewares/error.middleware')
const {NotFoundError} = require('./utils/errors')

const authRoutes = require('./routes/auth.routes')
const productRoutes = require('./routes/product.routes')
const categoryRoutes = require('./routes/category.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const reviewRoutes = require('./routes/review.routes');

const app = express();
app.use(express.json())

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'development-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true
    }
  })
);
  

app.use('/api/auth',authRoutes)
app.use('/api/products',productRoutes)
app.use('/api/categories',categoryRoutes)
app.use('/api/cart',cartRoutes)
app.use('/api/orders', orderRoutes);
app.use('/api', reviewRoutes);


// Handle undefined routes (404 Not Found)
app.use((req,res,next)=>{
    next( new NotFoundError('Route not found'))
})

app.use(errorHandler)

module.exports = app;
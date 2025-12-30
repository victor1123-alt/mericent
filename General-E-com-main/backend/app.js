const express = require('express');
const Route = require('./routers/productRouter');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authRoute = require('./routers/authrouter');
const cors = require('cors');
const cartRouter = require('./routers/cartrouter');
const orderRouter = require('./routers/order');
const adminRouter = require('./routers/admin');
const paymentRouter = require('./routers/paymentRouter');
app.use(cors({ 
  origin: [
    'https://mericent.vercel.app',
    'https://mericent-git-main-markcode.vercel.app',
    'http://localhost:5173' // for development
  ], 
  credentials: true 
}));
require('dotenv').config()

const PORT = process.env.PORT || 4444;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const connectionString = process.env.MONGO_CONNECTION || 'mongodb://127.0.0.1:27017/mercient';
mongoose.connect( connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => app.listen(PORT, () => {
        console.log(`hello i am listening to port:${PORT}`);
    }))
    .catch(err => console.log(err));

app.use('/api', Route);
app.use('/auth',authRoute);
app.use('/api/cart/',cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/admin', adminRouter);
app.use('/api', paymentRouter);
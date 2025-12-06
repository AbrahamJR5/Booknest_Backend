const bookRouter = require('./bookRouter');
const categoryRouter = require('./categoryRouter');
const reservacionRouter = require('./reservacionRouter');
const userRouter = require('./userRouter');


function routerApi(app){
  app.use('/books', bookRouter);
  app.use('/users', userRouter);
  app.use('/categories', categoryRouter);
  app.use('/reservations', reservacionRouter);
}

module.exports = routerApi; 
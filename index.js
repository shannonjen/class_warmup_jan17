const express = require('express');
const app = express();
const knexConfig = require('./knexfile.js')["development"]
const knex = require('knex')(knexConfig);

const bcrypt = require('bcrypt-as-promised');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json());

app.post('/users', (req,res,next) => {
  const { username, password } = req.body;

  knex('users')
    .where('username', username)
    .first()
    .then((user) =>{
      if (user) {
        const err = new Error('Username already taken, fool');
        err.status = 400;
        throw err;
      }
      return bcrypt.hash(password,8)
    })
    .then((hashed_password) => {
      return knex('users').insert({ username, hashed_password });
    })
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      next(err);
    })
})
app.use((req,res)=> {
  res.sendStatus(404);
})


app.use((err, _req, res, _next) => {
  if (err.status) {
    return res
      .status(err.status)
      .set('Content-Type', 'text/plain')
      .send(err.message);
  }

  console.error(err.stack);
  res.sendStatus(500);
});




app.listen(8000, () => {
  console.log("You are listening on port 8000...")
})

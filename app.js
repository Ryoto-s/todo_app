var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// start from here
var methodOverride = require('method-override');
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}));

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  /* 通常、サーバー上のURLを指定する */
  user: 'root',
  database: 'new_todo_app',
  password: 'myrootkit321dt'
});

/* let todos = [
  {
    id: 1,
    content: '料理'
  },
  {
    id: 2,
    content: '洗濯'
  },
  {
    id: 3,
    content: '掃除'
  },
  {
    id: 4,
    content: '換気'
  }
]; */

// redirect
app.get('/', function (req, res) {
  res.redirect('/todos');
});

// 一覧表示
app.get('/todos', function (req, res) {
  connection.query('SELECT * FROM new_todos', function(error, results) {
      res.render('index', { todos: results} );
    }
  )
  // 左で定義されたものがejsで使用され、右側で定義されたものがjsのを持ってくる
});
// URLにて、/の後に続くものを、パスと呼ぶ

// post
app.post('/todos', function (req, res) {
  connection.query(
    'INSERT INTO new_todos (content) VALUES (?)',
    [req.body.todoContent],
    function(error, results) {
      res.redirect('/todos');
    }
  )
});

// delete
app.delete('/todos/:id', function (req, res) {
  connection.query(
    'DELETE FROM new_todos WHERE id = ?',
    [req.params.id],
    function(error, results) {
      res.redirect('/todos')
    }
  )
});

// edit
app.get('/todos/:id/edit', function (req, res) {
  connection.query(
    'SELECT * FROM todos WHERE id = ?',
    [req.params.id],
    function(error, results) {
      res.render('edit', { todo: results[0] });
    }
  )
});

// update
app.put('/todos/:id', function (req, res) {
  for (let i in todos) {
    if (todos[i].id == req.params.id) {
      todos[i].content = req.body.todoContent;
    }
  }
  res.redirect('/todos');
});

app.get('/dotval', function (req, res) {
  res.send('Hello dotval');
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

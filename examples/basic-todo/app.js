// Import express and co
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

// Load config for RethinkDB and express
var config = require(__dirname+"/config.js")

// Import rethinkdbdash
//var thinky = require('thinky')(config.rethinkdb);
var thinky = require('../../')(config.rethinkdb);
var r = thinky.r;

// Create the model
var Todo = thinky.createModel("todos", {
    id: String,
    title: String,
    completed: Boolean,
    createdAt: {_type: Date, default: r.now()}
});

// Ensure that an index createdAt exists
Todo.ensureIndex("createdAt");


app.use(express.static(__dirname + '/public'));
app.use(bodyParser());

app.route('/todo/get').get(get);
app.route('/todo/new').put(create);
app.route('/todo/update').post(update);
app.route('/todo/delete').post(del);


// Retrieve all todos
function get(req, res, next) {
    Todo.orderBy({index: "createdAt"}).run().then(function(result) {
        res.send(JSON.stringify(result));
    }).error(handleError(res));
}

// Create a new todo
function create(req, res, next) {
    var todo = new Todo(req.body);
    todo.save().then(function(result) {
        res.send(JSON.stringify(result));
    }).error(handleError(res));
}

// Update a todo
function update(req, res, next) {
    var todo = new Todo(req.body);
    Todo.get(todo.id).run().then(function(todo) {
    
        todo.title = req.body.title;
        todo.completed = req.body.completed;

        todo.save().then(function(result) {
            res.send(JSON.stringify(result));
        }).error(handleError(res));
    }).error(handleError(res));
}

// Delete a todo
function del(req, res, next) {
    Todo.get(req.body.id).run().then(function(todo) {
        todo.delete().then(function(result) {
            res.send("");
        }).error(handleError(res));
    }).error(handleError(res));
}

function handleError(res) {
    return function(error) {
        return res.send(500, {error: error.message});
    }
}

// Start express
app.listen(config.express.port);
console.log('listening on port '+config.express.port);

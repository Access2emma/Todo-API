require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const app = express();
const port = process.env.PORT || 3000

app.use(bodyParser.json());

app.post('/todos', (request, response) => {
	let todo = new Todo({
		text: request.body.text,
		completed: request.body.completed
	});


	todo.save()
		.then(doc => {
			response.send(doc);
		})
		.catch(err => {
			response.status(400).send(err);
		});
});

app.get('/todos', (request, response) => {
	Todo.find().then(todos => {
		response.status(200).send({todos})
	}).catch(err => {
		response.status(400).send(err);
	});
});

app.get('/todos/:id', (request, response) => {
	const id = request.params.id;

	if(!ObjectID.isValid(id)){
		return response
			.status(404)
			.send({errorMessage: 'Wrong ID number for todo'})
	}

	Todo.findById(id)
		.then(todo => {
			if(!todo){
				return response
					.status(404)
					.send({errorMessage: 'Todo not found!'});
			}

			response.send({todo})
		}).catch(err => response.status(400).send(err))
});

app.delete('/todos/:id', (request, response) => {
	const id = request.params.id;

	if(!ObjectID.isValid(id)){
		return response
			.status(404)
			.send({errorMessage: 'Wrong ID number for todo'})
	}

	Todo.findByIdAndRemove(id)
		.then(todo => {
			if(todo){
				response.send(todo);
			}

			response.status(404)
				.send({errorMessage: 'Todo not found!'});
		})
		.catch(err => response.status(400).send(err))
});

app.patch('/todos/:id', (request, response) => {
	const id = request.params.id;

	if(!ObjectID.isValid(id)){
		response.status(404).send();
	}

	const body = _.pick(request.body, ['text', 'completed']);

	if(body.completed && _.isBoolean(body.completed)){
		body.completedAt = new Date().getTime();
	}else{
		body.completedAt = null;
		body.completed = false
	}

	Todo.findByIdAndUpdate(id, 
		{$set: body},
		{new: true}
	).then(todo => {
		if(!todo){
			response.status(404).send();
		}

		response.send(todo);

	}).catch(err => response.send(err));

});

// users route
app.post('/users', (request, response) => {
	const userInfo = _.pick(request.body, ['email', 'password']);

	const userObj = new User(userInfo);

	userObj.save()
		.then(user => {
			user.generateAuthToken()
				.then(token => {
					response.header('x-auth', token).send(user);
				})

		}).catch(err => response.send(err))
});


app.listen(port, () => {
	console.log(`Server started on port ${port}`);
})

module.exports = {app};
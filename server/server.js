require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

const app = express();
const port = process.env.PORT

app.use(bodyParser.json());

app.post('/todos', authenticate, (request, response) => {
	let todo = new Todo({
		text: request.body.text,
		_creator: request.user._id
	});


	todo.save()
		.then(doc => {
			response.send(doc);
		})
		.catch(err => {
			response.status(400).send(err);
		});
});

app.get('/todos', authenticate, (request, response) => {
	Todo.find({_creator: request.user._id}).then(todos => {
		response.status(200).send({todos})
	}).catch(err => {
		response.status(400).send(err);
	});
});

app.get('/todos/:id', authenticate, (request, response) => {
	const id = request.params.id;

	if(!ObjectID.isValid(id)){
		return response
			.status(404)
			.send({errorMessage: 'Wrong ID number for todo'})
	}

	Todo.findOne({
			_id: id,
			_creator: request.user._id
		})
		.then(todo => {
			if(!todo){
				return response
					.status(404)
					.send({errorMessage: 'Todo not found!'});
			}

			response.send({todo})
		}).catch(err => response.status(400).send(err))
});

app.delete('/todos/:id', authenticate, (request, response) => {
	const id = request.params.id;

	if(!ObjectID.isValid(id)){
		return response
			.status(404)
			.send({errorMessage: 'Wrong ID number for todo'})
	}

	Todo.findOneAndRemove({
			_id: id,
			_creator: request.user._id
		})
		.then(todo => {
			if(todo){
				response.send(todo);
			}

			response.status(404)
				.send({errorMessage: 'Todo not found!'});
		})
		.catch(err => response.status(400).send(err))
});

app.patch('/todos/:id', authenticate, (request, response) => {
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

	Todo.findOneAndUpdate({_id: id, _creator: request.user._id}, 
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

		}).catch(err => response.status(400).send(err))
});

app.get('/users/me', authenticate, (request, response) => {
	response.send(request.user);
});

app.post('/users/login', (request, response) => {
	const loginData = _.pick(request.body, ['email', 'password']);

	User.findByCredentials(loginData)
		.then(user => {
			user.generateAuthToken()
				.then(token =>{
					response.header('x-auth', token).send(user);
				})
		}).catch(err => {
			response.status(401).send({errorMessage: err})
		});
});

app.delete('/users/me/token', authenticate, (request, response) => {
	request.user.removeToken(request.token)
		.then(() => {
			response.status(200).send()
		}).catch(() => {
			response.status(400).send();
		});
});


app.listen(port, () => {
	console.log(`Server started on port ${port}`);
})

module.exports = {app};
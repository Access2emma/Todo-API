const {ObjectID} = require('mongodb');
const {Todo} = require('../models/todo');
const {User} = require('../models/user');
const jwt = require('jsonwebtoken');

const testTodos = [{
	_id: new ObjectID(),
	text: 'First test data',
	completed: false
}, {
	_id: new ObjectID(),
	text: 'Second test data',
	completed: true
}];

const user1ID = new ObjectID();
const user2ID = new ObjectID();


const testUsers = [
	{
		email: 'user1@test.com',
		password: 'user1@test.com'
	},{
		email: 'user2@test.com',
		password: 'user2@test.com',
		tokens: [{
			access: 'auth', 
			token: jwt.sign({_id: user1ID, access: 'auth'}, 'abc123!').toString()
		}]
	}
];

const populateUsers = (done) => {
	User.remove({})
		.then(() => {
			const user1 = new User(testUsers[0]);
			const user2 = new User(testUsers[1]);

			return Promise.all([user1.save(), user2.save()])
		}).then(()=>{
			done();
		})
}

const populateTodos = (done) => {
	Todo.remove({})
		.then(() => {
			return Todo.insertMany(testTodos)
		}).then(()=> done());
}

module.exports = {
	testUsers,
	testTodos,
	populateUsers,
	populateTodos
}
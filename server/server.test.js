const request = require('supertest');
const expect = require('expect');
const {ObjectID} = require('mongodb');

const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {app} = require('./server');
const {testUsers, testTodos, populateUsers, populateTodos}  = require('./test/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
	it('should save todo information in the database', (done) => {
		const text = "Let see what will happen tomorrow";

		request(app)
			.post('/todos')
			.send({text})
			.expect(200)
			.expect( resp => {
				expect(resp.body.text).toBeA('string');
				expect(resp.body.text).toBe(text);
			})
			.end((err, resp) => {
				if(err){
					return done(err);
				}

				Todo.find({text}).then(todos => {
					expect(todos.length).toBe(1);
					expect(todos[0].text).toBe(text)
					done();
				}).catch(err => done(err));
			});
	});

	it('should not create todo with invalid data', (done) => {
		
		request(app)
			.post('/todos')
			.send()
			.expect(400)
			.end( (err, resp) => {
				if(err){
					return done(err)
				}

				Todo.find({}).then(todos => {
					expect(todos.length).toBe(2);
					done();
				}).catch(err => done(err));
			});
	});
});

describe('GET /todos', () => {
	it('should return all todos', (done) => {
		request(app)
			.get('/todos')
			.expect(200)
			.expect( resp => {
				expect(resp.body.todos.length).toBe(2);
			})
			.end(done);
	});
});

describe('GET /todos/:id', () => {
	it('should return todo associated with the valid ID', (done) => {
		request(app)
			.get(`/todos/${testTodos[0]._id.toHexString()}`)
			.expect(200)
			.expect( resp => {
				expect(resp.body.todo._id).toBe(testTodos[0]._id.toHexString());
				expect(resp.body.todo.text).toBe(testTodos[0].text);
			}).end(done);
	})

	it('should return 404 if todo is not found', (done) => {
		request(app)
			.get(`/todos/${new ObjectID().toHexString()}`)
			.expect(404)
			.end(done)
	});

	it('should return 404 for none-object ID', (done) => {
		request(app)
			.get('/todos/123')
			.expect(404)
			.end(done);
	})
});

describe('DELETE /todos/:id', () => {

	it('should delete an existing todo with valid todo ID', (done)=>{
		request(app)
			.delete(`/todos/${testTodos[1]._id.toHexString()}`)
			.expect(200)
			.expect( resp => {
				expect(resp.body.text).toBeA('string');
				expect(resp.body.text).toBe(testTodos[1].text);
				expect(resp.body.completed).toEqual(testTodos[1].completed);
			})
			.end((err, resp) => {
				if(err){
					return done(err);
				}

				Todo.findById(testTodos[1]._id.toHexString())
					.then(todo =>{
						expect(todo).toNotExist();
						done();
					}).catch(err => done(err));
			});
	});

	it('should return 404 for non-object ID', (done) => {
		request(app)
			.delete('/todos/123456')
			.expect(404)
			.end(done)
	});

	it('should return 404 if ID not found', (done) => {
		request(app)
			.delete(`/todos/${new ObjectID().toHexString()}`)
			.expect(404)
			.end(done)
	});
});

describe('PATCH /todos/:id', () => {
	it('should update already existing todo', (done) => {
		const id1 = testTodos[0]._id.toHexString();
		request(app)
			.patch(`/todos/${id1}`)
			.send({completed: true})
			.expect(200)
			.expect( resp => {
				expect(resp.body.completed).toBeA('boolean');
				expect(resp.body.completed).toBe(true);
				expect(resp.body.completedAt).toExist();
			}).end( (err, resp) => {
				if(err){
					return done(err);
				}

				Todo.findById(id1)
					.then(todo => {
						expect(todo.completed).toBe(true);
						done();
					}).catch(err => done(err));
			})
	});

	it('should clear completedAt if complete is false', (done) => {
		const id2 = testTodos[1]._id.toHexString();
		request(app)
			.patch(`/todos/${id2}`)
			.send({completed: false})
			.expect(200)
			.expect( resp => {
				expect(resp.body.completed).toBeA('boolean');
				expect(resp.body.completed).toBe(false);
				expect(resp.body.completedAt).toNotExist();
			}).end( (err, resp) => {
				if(err){
					return done(err);
				}

				Todo.findById(id2)
					.then(todo => {
						expect(todo.completed).toBe(false);
						done();
					}).catch(err => done(err));
			})
	});
});

describe('GET /users/me', ()=>{
	it('should return user if authenticated', (done) =>{
		request(app)
			.get('/users/me')
			.set('x-auth', testUsers[1].tokens[0].token)
			.expect(200)
			.expect( resp => {
				expect(resp.body._id).toBe(testUsers[1]._id.toHexString());
				expect(resp.body.email).toBe(testUsers[1].email);
			})
			.end(done);
	});

	it('should return 401 if user not authenticated', (done) => {
		request(app)
			.get('/users/me')
			.expect(401)
			.expect( resp => {
				expect(resp.body)
					.toInclude({ errorMessage: 'Authentication Required' });
			})
			.end(done)
	});
});

describe('POST /users', () => {
	it('should create new user if information is unique', (done) => {
		const email = 'example@exaple.com';
		const password = 'password123!';

		request(app)
			.post('/users')
			.send({email, password})
			.expect(200)
			.expect( resp => {
				expect(resp.headers['x-auth']).toExist();
				expect(resp.body.email).toBe(email);
			})
			.end((err, resp) => {
				if(err){
					return done(err);
				}

				User.findOne({email})
					.then(user => {
						expect(user).toExist();
						expect(user.email).toBe(email);
						expect(user.password).toNotBe(password);
						done();
					})
					.catch(err => done(err));
			})
		});

	it('should return valiation error if request invalid', (done) => {
		const email = 'example@exaple.com';
		const password = '123!';

		request(app)
			.post('/users')
			.send({email, password})
			.expect(400)
			.end(done)
	});

	it('should not create user if email in use', (done) => {
		const email = testUsers[0].email
		const password = 'abc123!';
		request(app)
			.post('/users')
			.send({email, password})
			.expect(400)
			.end( (err, resp) => {
				if(err){
					done(err);
				}

				User.findOne({email})
					.then(user => {
						expect(user).toNotExist();
						done();
					}).catch(err => done());
			})
	});
});

describe('POST /users/login', () => {
	it('should login user and return the auth token', (done) => {
		const email = testUsers[0].email;
		const password = testUsers[0].password;

		request(app)
			.post('/users/login')
			.send({email, password})
			.expect(200)
			.expect( resp =>{
				expect(resp.headers['x-auth']).toExist();
				expect(resp.body.email).toBe(email);
			})
			.end((err, resp) => {
				User.findOne({email})
					.then(user => {
						expect(user.tokens[0]).toInclude({access: 'auth', token: resp.headers['x-auth']});
						done();
					}).catch(err => done(err));
			}); 
	});

	it('should reject invalid login', (done) => {
		const email = testUsers[0].email;
		const password = testUsers[1].password;

		request(app)
			.post('/users/login')
			.send({email, password})
			.expect(401)
			.end(done)
	});
});

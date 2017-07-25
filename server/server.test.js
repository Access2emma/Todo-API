const request = require('supertest');
const expect = require('expect');
const {ObjectID} = require('mongodb');

const {Todo} = require('./models/todo');
const {app} = require('./server');

const testTodos = [{
	_id: new ObjectID(),
	text: 'First test data'
}, {
	_id: new ObjectID(),
	text: 'Second test data'
}];

beforeEach((done)=>{
	Todo.remove({})
		.then(() => {
			return Todo.insertMany(testTodos)
		}).then(()=> done());
});

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
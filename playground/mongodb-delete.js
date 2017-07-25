const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
	if(err){
		return console.log('Unable to connect to MongoDB server');
	}

	console.log('Connected to MongoDB server');

	// db.collection('Users')
	// 	.deleteMany({name: 'Emmanuel'})
	// 		.then(result => console.log(result))
	// 		.catch(err => console.log(err));

	db.collection('Users')
		.findOneAndDelete({_id: new ObjectID('5975683fc1c0c5bb1be8a399')})
		.then(result => console.log(result))
		.catch(result => console.log(result));

});
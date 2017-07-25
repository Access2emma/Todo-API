const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
	if(err){
		return console.log('Unable to connect to MongoDB server');
	}

	console.log('Connected to MongoDB server');

	// db.collection('Todos')
	// 	.findOneAndUpdate({
	// 		_id: new ObjectID('59756272dde11f166c051df6')
	// 	},{
	// 		$set: {
	// 			completed: true
	// 		}
	// 	}, {
	// 		returnOriginal: false
	// 	})
	// 	.then(result => console.log(result));

	db.collection('Users')
		.findOneAndUpdate({
			_id: new ObjectID('597571f0c1c0c5bb1be8a545')
		},{
			$set: {
				name: 'Fetemi'
			},
			$inc: {
				age: 1
			}
		}, {
			returnOriginal: false
		})
		.then(result => console.log(result));

});
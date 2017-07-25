const env = process.env.NODE_ENV || 'production';

if(env === 'test'){
	process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/TodoAppTest';
}else if(env === 'production'){
	process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/TodoApp';
}
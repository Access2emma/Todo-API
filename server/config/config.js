const env = process.env.NODE_ENV || 'development';

if(env === 'test' || env === 'development'){
	const allConfig = require('./config.json');

	envConfig = allConfig[env];

	Object.keys(envConfig).forEach( key =>{
		process.env[key] = envConfig[key];
	});
}
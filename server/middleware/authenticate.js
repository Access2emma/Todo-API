const {User} = require('../models/user');

const authenticate = (request, response, next) => {
	const token = request.header('x-auth');

	User.findByToken(token)
		.then(user => {
			if(!user){
				return Promise.reject();
			}

			// success
			request.user = user;
			request.token = token;
			next();

		})
		.catch(() => {
			response.status(401).send({errorMessage: 'Authentication Required'})
		})
}

module.exports = {authenticate};
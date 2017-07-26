const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const UserSchema = mongoose.Schema({
	name: {
		type: String
	},
	email: {
		type: String,
		required: true,
		minlength: 1,
		trim: true,
		unique: true,
		validate: {
			validator: (value) => {
				return validator.isEmail(value);
			},
			message: '{VALUE} is not a valid E-mail address'
		}
	},
	password: {
		type: String,
		minlength: 6,
		required: true
	},
	tokens: [{
		access: {
			type: String,
			required: true
		},
		token: {
			type: String,
			required: true
		}
	}]
});

UserSchema.methods.toJSON = function(){
	let user = this;

	return _.pick(user.toObject(), ['_id', 'email']);
}

UserSchema.methods.generateAuthToken = function(){
	let user = this;

	const access = 'auth';
	const data = {
		_id: user._id.toHexString(),
		access
	}

	const token = jwt.sign(data, 'abc123!').toString();

	user.tokens.push({access, token});

	return user.save()
		.then(() => {
			return token;
		})
}

UserSchema.methods.removeToken = function(token){
	let user = this;

	return user.update({
		$pull: {
			tokens: {token}
		}
	});
}

UserSchema.statics.findByToken = function(token){
	let User = this;

	let decoded;

	try{
		decoded = jwt.verify(token, 'abc123!');
	}catch(e){
		return Promise.reject();
	}

	return User.findOne({
		_id: decoded._id,
		'tokens.access': decoded.access,
		'tokens.token': token
	});
}

UserSchema.statics.findByCredentials = function({email, password}){
	let User = this;

	return User.findOne({email})
		.then(user => {
			if(!user){
				return Promise.reject('User not found!');
			}

			return new Promise((resolve, reject) => {
				bcrypt.compare(password, user.password, (err, ok) => {
					if(ok){
						resolve(user);
					}

					reject('Invalid Login credentials');
				})
			});

		})
}

UserSchema.pre('save', function(next){
	let user = this;

	if(user.isModified('password')){
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(user.password, salt, (err, hash) => {
				user.password = hash;
				next();
			})
		})
	}else{
		next();
	}

});

const User = mongoose.model('User', UserSchema);

module.exports = {User};
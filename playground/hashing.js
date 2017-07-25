const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

// const text = 'Am user number 3';

// const hash = SHA256(text);

// console.log(`Message: ${text}`);
// console.log(`Hash: ${hash}`);


const data = {
	id: 4
}

// const token = {
// 	data,
// 	hash: SHA256(JSON.stringify(data)+'hello').toString()
// }

// const receivedData = {
// 	data: {
// 		id: 4
// 	},
// 	hash: SHA256(JSON.stringify(data)).toString()
// }

// if(token.hash === receivedData.hash){
// 	console.log('The data is valid');
// }else{
// 	console.log('Invalid data received');
// }

// console.log(token);


token = jwt.sign(data, 'salted-word');

console.log(token);

const decodedData = jwt.verify(token, 'salted-word');
console.log('Decode: ', decodedData);
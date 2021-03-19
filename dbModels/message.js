const mongoose = require('mongoose');

module.exports = mongoose.model('Message', {
    name: String,
    message: String
});
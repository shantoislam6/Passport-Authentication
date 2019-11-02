const mongoose = require('mongoose');
const schema = mongoose.Schema;

const blogSchema = new schema({
    title: {
        type: String,
        required:[true, 'Tyle Field is must be requried'],
    },
    body:{
        type: String,
        required:[true, 'Tyle Field is must be requried']
    },
    user_id: {
        type: String,
        required: true,
    },
    created_at:{
        type: Date,
        default: Date.now()
    }
});

const blogModel = mongoose.model('blog', blogSchema);

module.exports = blogModel;
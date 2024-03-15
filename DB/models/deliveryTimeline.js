const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the status update schema
const statusUpdateSchema = new Schema({
    status: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now // Automatically set to the current date and time
    }
});

// Define the delivery schema
const deliveryTimelineSchema = new Schema({
    orderID: {
        type: String,
        required: true,
        unique:true
    },
    statusTimeline: [statusUpdateSchema]
}, {
    timestamps: true,
});

// Create a model from the schema
const deliveryTimeline = mongoose.model('deliveryTimeline', deliveryTimelineSchema);

module.exports = deliveryTimeline;
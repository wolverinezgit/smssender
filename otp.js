const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Connect to MongoDB
mongoose.connect('mongodb+srv://user:bt1id4CQAaoYOa4X@cluster0.wrpgaob.mongodb.net/', { 
    useNewUrlParser: true,
    useUnifiedTopology: true 
}).then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.log("Failed to connect to MongoDB", err);
});

// Define a Mongoose schema
const MessageSchema = new mongoose.Schema({
    message: String,
}, {
    timestamps: true, // Automatically create createdAt and updatedAt fields
});

// Create a Mongoose model
const Message = mongoose.model('Message', MessageSchema);

const app = express();

app.use(bodyParser.json());

// Function to clean up old data
async function cleanupOldMessages() {
    const tenMinutesAgo = new Date(Date.now() - 10*60*1000); // Time 10 minutes ago

    await Message.deleteMany({ createdAt: { $lt: tenMinutesAgo } });
}

app.post('/messages', async (req, res) => {
    // Create a new message
    const message = new Message({
        message: req.body.message,
    });

    // Save it to MongoDB
    try {
        await message.save();
        res.send('Message saved!');

        // Clean up old messages
        await cleanupOldMessages();
    } catch (err) {
        res.status(500).send('Error: ' + err);
    }
});

app.get('/messages/recent', async (req, res) => {
    // Fetch the most recently saved message
    try {
        const message = await Message.findOne().sort('-createdAt');
        if (message) {
            res.send(message);
        } else {
            res.status(404).send('No messages found');
        }
    } catch (err) {
        res.status(500).send('Error: ' + err);
    }
});

app.listen(3000, () => console.log('Server listening on port 3000'));

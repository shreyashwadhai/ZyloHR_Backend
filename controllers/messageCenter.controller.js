const Message = require('../models/message.model.js');
const User = require('../models/user.model.js');


const getMessages = async (req, res) => {
    try {
        const userId = req.user._id;
        const { conversationWith } = req.query;

        let query = {
            $or: [{ sender: userId }, { receiver: userId }]
        };

        // If specific conversation is requested
        if (conversationWith) {
            query = {
                $or: [
                    { sender: userId, receiver: conversationWith },
                    { sender: conversationWith, receiver: userId }
                ]
            };
        }

        const messages = await Message.find(query)
            .populate('sender', 'name avatar role')
            .populate('receiver', 'name avatar role')
            .sort({ createdAt: -1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body
        const senderId = req.user._id

        if (!receiverId || !content) {
            return res.status(400).json({ message: 'Please provide all required fields' })
        }

        // Get sender and receiver details
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ message: 'User not found' });
        }

        const message = new Message({
            sender: senderId,
            receiver: receiverId,
            senderName: sender.name,
            receiverName: receiver.name,
            content
        });

        const savedMessage = await message.save()
        const populatedMessage = await Message.findById(savedMessage._id)
            .populate('sender', 'name avatar role')
            .populate('receiver', 'name avatar role')

        // Emit the message to the receiver via Socket.io
        const io = req.app.get('io');
        if (io) {
            io.emit('newMessage',
                populatedMessage);
        }

        // req.io.to(receiverId.toString()).emit('newMessage', populatedMessage)

        res.status(201).json(populatedMessage)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getConversation = async (req, res) => {
    try {
        const userId = req.user._id
        const otherUserId = req.params.userId

        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId }
            ]
        })
            .populate('sender', 'name avatar role')
            .populate('receiver', 'name avatar role')
            .sort({ createdAt: 1 })

        res.status(200).json(messages)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const markAsRead = async (req, res) => {
    try {
        const userId = req.user._id
        const senderId = req.params.senderId

        await Message.updateMany(
            {
                sender: senderId,
                receiver: userId,
                read: false
            },
            {
                $set: { read: true, readAt: new Date() }
            }
        )

        res.status(200).json({ message: 'Messages marked as read' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id;

        const unreadCount = await Message.countDocuments({
            receiver: userId,
            read: false
        });

        res.status(200).json({ unreadCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMessages,
    sendMessage,
    getConversation,
    markAsRead,
    getUnreadCount
};
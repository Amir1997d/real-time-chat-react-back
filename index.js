const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { Sequelize, DataTypes } = require('sequelize');
const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  transports: ["websocket", "polling"]
});

const sequelize = new Sequelize('task6db', 'task6db_user', 'pqDyCYOz0jMF0ozcWiP0U3gh34i6toTU', {
    host: 'dpg-cka61vfs0fgc73angivg-a',
    port: 5432,
    dialect: 'postgres',
});

const Message = sequelize.define('message', {
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

const Tag = sequelize.define('tag', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

app.use(express.json());

io.on('connection', (socket) => {
  console.log('A user connected');

  Message.findAll().then((messages) => {
    socket.emit('all-messages', messages);
  });

  socket.on('newMessage', async (data) => {
    try {
      const { text } = data;
      const message = await Message.create({ text });
      io.emit('newMessage', { text: message.text });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  Tag.findAll()
  .then((tags) => {
    socket.emit('all-tags', tags);
  });

  socket.on('newTag', async (data) => {
    try {
      const { tags } = data;
      for(let i = 0; i < tags.length; i++) {
        const tag = await Tag.create({ name: tags[i] });
        const allTags = Tag.findAll()
        .then((tags) => {
          io.emit('newTag', tags);
        });
      }
    } catch (error) {
      console.error('Error sending tag:', error);
    }
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

sequelize.sync();

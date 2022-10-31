const WebSocketServer = new require('ws');
const fs = new require('fs');

const webSocketServer = new WebSocketServer.Server({ port: 9000 });
let users;
let fileContent;
const server = {
  name: 'Server',
  photo: null,
};

initFS();

function initFS() {
  if (fs.existsSync('data.txt')) {
    loadUsers();
  } else {
    users = [];
    saveUsers();
  }
}

function saveUsers() {
  const data = users.map(
    (item) =>
      (item = {
        name: item.name,
        photo: item.photo,
        msg: item.msg,
      })
  );
  fs.writeFileSync('data.txt', JSON.stringify(data));
}

function loadUsers() {
  fileContent = fs.readFileSync('data.txt', 'utf8');
  users = JSON.parse(fileContent);
}

function getUserIdByName(userName) {
  let result = null;
  users.forEach((item, id) => {
    if (item.name === userName) {
      result = id;
    }
  });
  return result;
}

function sendOne(info, user) {
  const data = JSON.stringify(info);
  user.ws.send(data);
}

function sendToEveryone(info) {
  const data = JSON.stringify(info);
  users.filter((item) => item.isActive).forEach((item) => item.ws.send(data));
}

function sendUsersToEveryone() {
  const activeUsers = [];
  users
    .filter((item) => item.isActive)
    .forEach((item) => {
      activeUsers.push({
        name: item.name,
        photo: item.photo,
        msg: item.msg,
      });
    });
  const data = {
    type: 'usersInfo',
    activeUsers: activeUsers,
  };
  sendToEveryone(data);
}

webSocketServer.on('connection', function (ws) {
  let myId = null;
  let myName = null;
  console.log('New Connection');

  function authByUserName(userName) {
    if (myId !== null) {
      users[myId].ws = ws;
      users[myId].isActive = true;
    } else {
      users.push({ ws: ws, name: userName, photo: null, isActive: true });
      myId = users.length - 1;
    }
    return true;
  }

  ws.on('message', function (message) {
    const msg = JSON.parse(message);
    const type = msg.type;

    if (type === 'auth') {
      myName = msg.name;
      myId = getUserIdByName(myName);
      authByUserName(myName);
      saveUsers();

      sendOne({ type: 'auth-ok' }, users[myId]);
      sendUsersToEveryone();
      sendToEveryone({ type: 'chat', from: server, msg: `${myName} connected` });
    } else if (type === 'chat') {
      users[myId].msg = msg.msg;
      saveUsers();
      sendToEveryone({ type: 'chat', from: users[myId], msg: msg.msg });
    } else if (type === 'newPhoto') {
      users[myId].photo = msg.photo;
      saveUsers();
      sendUsersToEveryone();
    }
  });

  ws.on('close', function () {
    if (users[myId]) {
      users[myId].isActive = false;
    }
    saveUsers();
    sendUsersToEveryone();
    sendToEveryone({
      type: 'chat',
      from: server,
      msg: `${myName === null ? 'Unknown user' : myName} disconnected`,
    });
  });
});

console.log('Сервер запущен на порту 9000');

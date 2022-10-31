import './chat.html';

const app = document.querySelector('#app');

function initAuth() {
  const authBlock = document
    .getElementById('auth')
    .content.cloneNode(true).firstElementChild;
  app.appendChild(authBlock);
}

function sendToServer(info) {
  const data = JSON.stringify(info);
  socket.send(data);
}

function auth() {
  const formUser = app.querySelector('.form__user');
  user.name = formUser.value;
  if (user.name !== '') {
    sendToServer({ type: 'auth', name: user.name });
    formUser.value = '';
  }
}

function initChat() {
  const chatBlock = document
    .getElementById('chat')
    .content.cloneNode(true).firstElementChild;
  app.removeChild(app.firstElementChild);
  app.appendChild(chatBlock);
}

function updateChat(data) {
  activeUsers = data.activeUsers;
  const friendsList = document.querySelector('.friends__list');
  friendsList.innerHTML = '';
  activeUsers.forEach((item) => {
    const friend = document
      .getElementById('chat')
      .content.cloneNode(true)
      .querySelector('.friends__item');
    friend.querySelector('.friend__name').textContent = item.name;
    let newPhoto = defaultPhoto;
    if (item.photo !== null) newPhoto = item.photo;
    friend.querySelector('.friend__img').src = newPhoto;
    friendsList.appendChild(friend);
  });

  const numberOfActives = document.querySelector('.chat__descr');
  numberOfActives.textContent = `${activeUsers.length} участник${declensionByNumber(
    activeUsers.length
  )}`;

  const messages = app.querySelectorAll('.message__name');
  messages.forEach((item) => {
    let userPhoto;
    const userName = item.textContent;
    const userInActiveUsers = activeUsers.find((item) => item.name === userName);
    if (userInActiveUsers && userInActiveUsers.photo) {
      userPhoto = userInActiveUsers.photo;
    } else {
      userPhoto = defaultPhoto;
    }
    const imgContainer = item.parentNode.querySelector('.message__img');
    imgContainer.src = userPhoto;
  });
}

function addChatMessage(data) {
  const message = data.msg;
  const sender = data.from;
  const chatContent = document.querySelector('.chat__content');
  if (lastMessageSender === sender.name) {
    chatContent.appendChild(createMessage(message, false, sender));
  } else {
    chatContent.appendChild(createMessage(message, true, sender));
    lastMessageSender = sender.name;
  }

  chatContent.parentNode.scrollTop = chatContent.parentNode.scrollHeight;
}

function createMessage(msg, isFirstMessage = false, sender) {
  const message = document
    .getElementById('message')
    .content.cloneNode(true).firstElementChild;
  const messageName = message.querySelector('.message__name');
  const messageTick = message.querySelector('.message__tick');
  const messageImg = message.querySelector('.message__img');

  if (isFirstMessage) {
    messageName.textContent = sender.name;
    if (sender.photo === null) {
      messageImg.src = defaultPhoto;
    } else {
      messageImg.src = sender.photo;
    }
  } else {
    message.removeChild(messageName);
    message.removeChild(messageTick);
    message.removeChild(messageImg);
  }
  if (sender.name !== user.name) {
    message.classList.add('message--another');
    messageTick.classList.add('message__tick--another');
    messageImg.classList.add('message__img--another');
  }

  message.querySelector('.message__time').textContent = getTime();
  message.querySelector('.message__content').textContent = msg;
  return message;
}

function getTime() {
  const date = new Date();
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  return `${hours}:${minutes}`;
}

function declensionByNumber(number) {
  if (number > 4 && number < 21) {
    return 'ов';
  } else if (number % 10 > 4) {
    return 'ов';
  } else if (number % 10 === 0) {
    return 'ов';
  } else if (number % 10 === 1) {
    return '';
  } else if (number % 10 <= 4) {
    return 'a';
  }
}

function sendMessage() {
  const formInput = app.querySelector('.form__msg');
  const message = formInput.value;
  sendToServer({ type: 'chat', msg: message });
  formInput.value = '';
}

function sendNewPhoto(photo) {
  const data = {
    type: 'newPhoto',
    photo: photo,
  };

  sendToServer(data);
}

function showPhotoForm() {
  const photoForm = document
    .getElementById('loadphoto')
    .content.cloneNode(true).firstElementChild;
  photoForm.querySelector('.newphoto__name').textContent = user.name;
  app.appendChild(photoForm);

  const photoPreview = photoForm.querySelector('.newphoto__preview');
  const photoInput = photoForm.querySelector('#photoInput');
  const fileReader = new FileReader();

  photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        console.log('Файл слишком большой!');
      } else {
        fileReader.readAsDataURL(file);
      }
    }
  });

  fileReader.addEventListener('load', () => {
    photoPreview.src = fileReader.result;
    user.photo = fileReader.result;
    sendNewPhoto(fileReader.result);
  });
}

function removePhotoForm() {
  const photoForm = app.querySelector('.overlay');
  app.removeChild(photoForm);
}

function updateLastMessages(user, message) {
  const friendsList = app.querySelectorAll('.friend__name');
  friendsList.forEach((item) => {
    if (item.textContent === user.name) {
      item.parentNode.querySelector('.friend__message').textContent = message;
    }
  });
}

const socket = new WebSocket('ws://localhost:9000');
const user = {
  name: null,
  photo: null,
};
let lastMessageSender = null;
let activeUsers = [];
const defaultPhoto = 'projects/project-chat/1x1.png';

initAuth();

socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'auth-ok') {
    initChat();
    showPhotoForm();
  } else if (data.type === 'usersInfo') {
    updateChat(data);
  } else if (data.type === 'chat') {
    addChatMessage(data);
    updateLastMessages(data.from, data.msg);
  }
});

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('auth__btn')) {
    e.preventDefault();
    auth();
  } else if (e.target.classList.contains('chat__btn')) {
    e.preventDefault();
    sendMessage();
  } else if (e.target.classList.contains('newphoto__close')) {
    removePhotoForm();
  } else if (e.target.classList.contains('hamburger')) {
    showPhotoForm();
  }
});

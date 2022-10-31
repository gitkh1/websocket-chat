# Приложение Чат

Приложение чат на вебсокетах и небольшой веб-сервер к нему

## Что делает приложение

- Показывает страницу входа в чат
- При входе отображается окно чата, состоящее из информации о текущем пользователе, списке пользователей, списке сообщений, поля для ввода сообщения
- Когда кто-то входит в чат, добавляется его ник в список пользователей
- Когда кто-то выходит из чата, удаляется его ник из списка пользователей
- Когда кто-то присылает сообщение, добавляется ник и фото автора, время и текст сообщения в список сообщений
- Позволяет загружать фотографию в качество своего аватара

## Что делает сервер

- Сообщает всем, когда кто-то заходит в чат
- Сообщает всем, когда кто-то выходит из чата
- Сообщает всем, когда кто-то отправляет сообщение в чат
- Позволяет загружать фото на сервер и хранить их там
- Отдает фотографии с сервера, чтобы отображать их в чате

## Как запускать

- `start` - запустить вебсокет-сервер и клиент для локальной разработки
- `build` - собрать проект в папку dist

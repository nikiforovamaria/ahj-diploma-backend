const http = require('http');
const path = require('path');
const fs = require('fs');
const Koa = require('koa');
const koaStatic = require('koa-static');
const koaBody = require('koa-body')
const { v4: uuidv4 } = require('uuid');
const Router = require("koa-router");
const cors = require('@koa/cors');

const app = new Koa();
const url = 'https://maryniki-ahj-diploma.herokuapp.com';

const public = path.join(__dirname, '/public')
app.use(koaStatic(public));

app.use(koaBody({
  urlencoded: true,
  multipart: true,
  json: true,
}));

const data = {
  message: [],
  link: [],
  image: [],
  video: [],
  audio: [],
}

app.use(cors({
    origin: '*',
    credentials: true,
    'Access-Control-Allow-Origin': true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  }));

const router = new Router();

app.use(async (ctx) => {
  if (ctx.request.files) {
    const { file } = ctx.request.files;
    if (file) {
      const type = file.type.split('/')[0];
      const extension = file.type.split('/')[1];
      const link = await new Promise((resolve, reject) => {
      const oldPath = file.path;
      const filename = `${uuidv4()}.${extension}`;
      const newPath = path.join(public, filename);
        
      const callback = (error) => reject(error);
        
      const readStream = fs.createReadStream(oldPath);
      const writeStream = fs.createWriteStream(newPath);
        
      readStream.on('error', callback);
      writeStream.on('error', callback);
        
      readStream.on('close', () => {
        console.log('close');
        fs.unlink(oldPath, callback);
        resolve(filename);
      });
        
      readStream.pipe(writeStream);
    });

    data[type].push({
      link: `${url}/${link}`,
      type,
      dateObj: `${ new Date().toLocaleDateString() } ${ new Date().toLocaleTimeString() }`,
    });
        
    ctx.response.body = JSON.stringify({
      link: `${url}/${link}`,
      type,
      dateObj: `${ new Date().toLocaleDateString() } ${ new Date().toLocaleTimeString() }`,
    });
    return;
    }
  }

  const { text, type, array, media, init } = ctx.request.query;

  if (init) {
    ctx.response.body = data;
  }

  if (media) {
    ctx.response.body = data[media];
  }

  switch (text) {
    case 'getMessage':
      ctx.response.body = JSON.stringify(data.message);
      return;
    case 'getLink':
      ctx.response.body = JSON.stringify(data.link);
      return;
    case 'getImage':
      ctx.response.body = JSON.stringify(data.image);
      return;
    case 'getVideo':
      ctx.response.body = JSON.stringify(data.video);
      return;
    case 'getAudio':
      ctx.response.body = JSON.stringify(data.audio);
      return;
    default:
      break;
  }
  
  const obj = {
    text,
    type,
    id: uuidv4(),
    dateObj: `${ new Date().toLocaleDateString() } ${ new Date().toLocaleTimeString() }`,
  }
  
  switch (type) {
    case 'link':
      data.link.push(obj);
      obj.length = data.link.length;
      obj.array = 'link';
      ctx.response.body = JSON.stringify(obj);
      break;
    case 'message':
      data.message.push(obj);
      obj.length = data.message.length;
      obj.array = 'message';
      ctx.response.body = JSON.stringify(obj);
      break;
    case 'image':
      data.image.push(obj);
      obj.length = data.image.length;
      obj.array = 'image';
      ctx.response.body = JSON.stringify(obj);
      break;
    case 'video':
      data.video.push(obj);
      obj.length = data.video.length;
      obj.array = 'video';
      ctx.response.body = JSON.stringify(obj);
      break;
    case 'audio':
      data.audio.push(obj);
      obj.length = data.audio.length;
      obj.array = 'audio';
      ctx.response.body = JSON.stringify(obj);
      break;
  }

  switch (array) {
    case 'link':
      ctx.response.body = ['link', data.link.length];
      break;
    case 'message':
      ctx.response.body = ['message', data.message.length];
      break;
    case 'image':
      ctx.response.body = ['image', data.image.length];
      break;
    case 'video':
      ctx.response.body = ['video', data.video.length];
      break;
    case 'audio':
      ctx.response.body = ['audio', data.audio.length];
      break;
    default:
      break;
  }
});

app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback())
server.listen( port , '0.0.0.0');
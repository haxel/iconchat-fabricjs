var express = require('express')
    util = require('util'),
    uuid = require('node-uuid'),
    fabric = require('fabric').fabric,
    formidable = require('formidable'),
    http = require('http'),
    fs = require('fs'),
    path = require('path'),
    passport = require('passport'),
    memstore = new express.session.MemoryStore(),
    LocalStrategy = require('passport-local').Strategy,
    flash = require('connect-flash'),
    passportSocketIo = require("passport.socketio");

var app = express()
  , server = http.createServer(app)
  , io = require('socket.io').listen(server); 

var SECRET = 'whatever floats your boat';

io.set("authorization", passportSocketIo.authorize({
  sessionKey:    'iconuu.sid',      //the cookie where express (or connect) stores its session id.
  sessionStore:  memstore,     //the session store that express uses
  sessionSecret: SECRET, //the session secret to parse the cookie
  fail: function(data, accept) {     // *optional* callbacks on success or fail
    accept(null, false);             // second param takes boolean on whether or not to allow handshake
  },
  success: function(data, accept) {
   accept(null, true);
  }
}));

var canvas = fabric.createCanvasForNode(200, 200);

var settings = {
    node_port: process.argv[2] || 3000,
    uploadpath: __dirname + '/uploads/'
};

var users = {};

passport.use(new LocalStrategy(
  function(username, password, done) {
    if(users.hasOwnProperty(username)) {
      if(users[username].password == password)
        return done(null,users[username]);
      else
        return done(null,false,{ message: 'password is wrong.' });
    } else {
      users[username] = { 
        username : username,
        password : password 
      }
      return done(null,users[username]);
    }
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  done(null,users[username]);
});

server.listen(settings.node_port);

app.configure(function(){   
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use('/login',express.bodyParser()); // body needs to be parsed for POST -> /login 
  app.use(express.methodOverride());
  app.use(express.session({ store: memstore, key : 'iconuu.sid', secret : SECRET }))
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.errorHandler());
});


app.get(
  '/',
  ensureAuthenticated,
  function(req, res) {
    res.render('index',{ user: req.user }); 
  }
);

app.get(
  '/uploads/:file', 
  function(req, res){
    file = req.params.file;
    res.sendfile(settings.uploadpath + file);
  }
);

app.get(
  '/login', 
  function(req, res) {
    if(req.isAuthenticated()) res.redirect('/');
    res.render('login',{ 
      message: req.flash('error')
    }); 
  }
);

app.post(
  '/login', 
  function(req, res, next) {
    if(req.isAuthenticated()) res.redirect('/');
    passport.authenticate('local', { 
      successRedirect: '/', 
      failureRedirect: '/login' , 
      failureFlash: true 
    })(req, res, next);
  }
);

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.post(
  '/upload', 
  ensureAuthenticated,
  function(req,res) {
    var form = new formidable.IncomingForm(),
      files = [],
      errors = [];

    form.on('file',function(name,file) {
      var cleanup = function(){
        fs.unlinkSync(file.path);
      };
      var is = fs.createReadStream(file.path)
      var os = fs.createWriteStream(settings.uploadpath + file.name);
      is.pipe(os);
      is.on('end',function(){
        cleanup();
        files.push(file);
      });
      os.on('error',function(e){
        cleanup();
        errors.push(e);
      });
      files.push(file.name);
    }).on('progress',function(bytesReceived,bytesExpected){
    }).on('error',function(e) {
      errors.push(e);
    }).on('end',function() {
      res.end(JSON.stringify({success: true,files : files,error: errors}));
    }).parse(req); 
  }
);

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

io.sockets.on('connection', function(socket) {
  for (username in users) {
      if(username != socket.handshake.user.username)
        socket.emit('add client', { client : username });
  };
  socket.broadcast.emit('add client', { client : socket.handshake.user.username });
  socket.on('add item',function(item){
      socket.broadcast.emit('draw item', { client : socket.handshake.user.username , item : item });
  });
  socket.on('disconnect', function () {
    socket.broadcast.emit('remove client', { client : socket.handshake.user.username });
  });


});


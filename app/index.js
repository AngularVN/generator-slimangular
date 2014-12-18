'use strict';
var util = require('util'),
  path = require('path'),
  yeoman = require('yeoman-generator'),
  yosay = require('yosay'),
  _ = require('lodash'),
  _s = require('underscore.string'),
  pluralize = require('pluralize'),
  asciify = require('asciify');

var SlimangularGenerator = module.exports = function SlimangularGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function() {
    this.installDependencies({
      skipInstall: options['skip-install']
    });

    if (this.generatorConfig.databaseType === 'sqlite') {
      this.spawnCommand('sqlite3', ['-line', this.generatorConfig.databaseName, 'select 1']);
    }

    if (this.generatorConfig.composer) {
      this.spawnCommand('composer', ['update']);
    }
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(SlimangularGenerator, yeoman.generators.Base);

SlimangularGenerator.prototype.welcome = function welcome() {
  if (!this.options['skip-welcome-message']) {
    this.log(yosay());
  }
};

SlimangularGenerator.prototype.askFor = function askFor() {

  var cb = this.async();

  var prompts = [{
    type: 'input',
    name: 'baseName',
    message: 'What is the name of your application?',
    default: 'myApp'
  }, {
    type: 'list',
    name: 'databaseType',
    message: 'Which database would you like to use?',
    choices: ['MySQL', 'SQLite', 'PostgreSQL'],
    default: 'SQLite'
  }, {
    type: 'input',
    name: 'hostName',
    message: 'What is your host name?',
    default: 'localhost'
  }, {
    type: 'input',
    name: 'databaseName',
    message: 'What is your database name?',
    default: 'example'
  }, {
    type: 'input',
    name: 'userName',
    message: 'What is your database user name?',
    default: 'username'
  }, {
    type: 'input',
    name: 'password',
    message: 'What is your database password?',
    default: 'password'
  }, {
    type: 'confirm',
    name: 'authenticate',
    message: 'Are you want include Authentication?',
    default: 'false'
  }, {
    type: 'confirm',
    name: 'composer',
    message: 'Is PHP composer installed globally (so that "composer update" can be run automatically)?',
    default: false
  }];

  this.prompt(prompts, function(props) {
    this.baseName = props.baseName;
    this.databaseType = props.databaseType == 'PostgreSQL' ? 'pgsql' : props.databaseType.toLowerCase();
    this.hostName = props.hostName;
    if (props.databaseType == 'SQLite' && props.databaseName.indexOf('/') != 0) {
      this.databaseName = '/tmp/' + props.databaseName + '.sqlite';
    } else {
      this.databaseName = props.databaseName;
    }
    this.userName = props.userName;
    this.password = props.password;
    this.composer = props.composer;
    this.authenticate = props.authenticate;

    cb();
  }.bind(this));
};

SlimangularGenerator.prototype.app = function app() {
  this.entities = [];
  this.generatorConfig = {
    "baseName": this.baseName,
    "databaseType": this.databaseType,
    "hostName": this.hostName,
    "databaseName": this.databaseName,
    "userName": this.userName,
    "password": this.password,
    "authenticate": this.authenticate,
    "entities": this.entities,
    "composer": this.composer,
  };
  this.generatorConfigStr = JSON.stringify(this.generatorConfig, null, '\t');

  var tpl = '../../templates/';
  this.template(tpl + '_generator.json', 'generator.json');
  this.template(tpl + '_package.json', 'package.json');
  this.template(tpl + '_bower.json', 'bower.json');
  this.template(tpl + 'bowerrc', '.bowerrc');
  this.template(tpl + 'Gruntfile.coffee', 'Gruntfile.coffee');
  this.copy(tpl + 'gitignore', '.gitignore');
  this.copy(tpl + 'editorconfig', '.editorconfig');
  this.copy(tpl + 'jshintrc', '.jshintrc');

  var serverDir = 'server/';
  var configDir = serverDir + 'config/';
  var helperDir = serverDir + 'helpers/';
  var modelsDir = serverDir + 'models/';
  var migrationsDir = configDir + 'migrations/';
  var publicDir = 'client/';
  var lessDir = publicDir + 'styles-less/';
  this.mkdir(serverDir);
  this.mkdir(configDir);
  this.mkdir(helperDir);
  this.mkdir(modelsDir);
  this.mkdir(migrationsDir);
  this.mkdir(publicDir);
  this.mkdir(lessDir);

  this.template(tpl + '_composer.json', 'composer.json');
  this.template(tpl + 'server/_app.php', serverDir + 'app.php');
  this.template(tpl + 'server/config/_app.php', configDir + 'app.php');
  this.template(tpl + 'server/config/_phpmig.php', configDir + 'phpmig.php');
  this.template(tpl + 'server/helpers/_validator.php', helperDir + 'validator.php');
  this.template(tpl + 'server/helpers/_restresponse.php', helperDir + 'restresponse.php');
  this.template(tpl + 'client/_index.php', publicDir + 'index.php');
  this.copy(tpl + 'client/htaccess', publicDir + '.htaccess');
  this.copy(tpl + 'client/favicon.ico', publicDir + 'favicon.ico');
  this.copy(tpl + 'client/404.html', publicDir + '404.html');
  this.copy(tpl + 'client/robots.txt', publicDir + 'robots.txt');

  var publicCssDir = publicDir + 'css/';
  var publicJsDir = publicDir + 'js/';
  var publicViewDir = publicDir + 'views/';
  this.mkdir(publicCssDir);
  this.mkdir(publicJsDir);
  this.mkdir(publicViewDir);
  this.copy(tpl + 'client/styles-less/_common.less', lessDir + 'common.less');
  this.template(tpl + 'client/styles-less/_app.less', lessDir + 'app.less');
  this.template(tpl + 'client/js/_app.js', publicJsDir + 'app.js');
  this.template(tpl + 'client/js/_filters.js', publicJsDir + 'filters.js');
  this.template(tpl + 'client/js/_services.js', publicJsDir + 'services.js');
  this.template(tpl + 'client/js/_directives.js', publicJsDir + 'directives.js');
  this.template(tpl + 'client/js/_controllers.js', publicJsDir + 'controllers.js');

  this.template(tpl + 'client/_index.html', publicDir + 'index.html');
  this.template(tpl + 'client/views/_nav.html', publicViewDir + 'nav.html');
  this.template(tpl + 'client/views/_flash.html', publicViewDir + 'flash.html');
  this.template(tpl + 'client/views/_signin.html', publicViewDir + 'signin.html');
  this.template(tpl + 'client/views/_header.html', publicViewDir + 'header.html');
  this.template(tpl + 'client/js/home/_home-controller.js', publicJsDir + 'home/home-controller.js');
  this.template(tpl + 'client/views/home/_home.html', publicViewDir + 'home/home.html');
  if (this.authenticate) {
    var d = new Date();
    var dateStr = '' + d.getFullYear() + (d.getMonth() + 1) + d.getDate() + d.getHours() + d.getMinutes() + d.getSeconds();
    this.copy(tpl + 'server/models/_AuthToken.php', modelsDir + 'AuthToken.php');
    this.copy(tpl + 'server/models/_Role.php', modelsDir + 'Role.php');
    this.copy(tpl + 'server/models/_User.php', modelsDir + 'User.php');
  }
};
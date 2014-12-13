'use strict';
var util = require('util'),
	path = require('path'),
	yeoman = require('yeoman-generator'),
	yosay = require('yosay'),
	fs = require('fs'),
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
		//this.log(yosay());
	}
};


SlimangularGenerator.prototype.files = function files() {
	this.generatorConfig = this.dest.readJSON('generator.json');
	this.baseName = this.generatorConfig.baseName;
	this.databaseType = this.generatorConfig.databaseType;
	this.hostName = this.generatorConfig.hostName;
	this.databaseName = this.generatorConfig.databaseName;
	this.userName = this.generatorConfig.userName;
	this.password = this.generatorConfig.password;
	this.entities = this.generatorConfig.entities;
	this.authenticate = this.generatorConfig.authenticate;
	this.composer = this.generatorConfig.composer;
	this.pluralize = pluralize;


	var tpl = '../../templates/';
	//this.template('_generator.json', 'generator.json');
	this.template(tpl + '_package.json', 'package.json');
	this.template(tpl + '_bower.json', 'bower.json');
	this.template(tpl + 'bowerrc', '.bowerrc');
	this.template(tpl + 'Gruntfile.coffee', 'Gruntfile.coffee');
	this.copy(tpl + 'gitignore', '.gitignore');
	this.copy(tpl + 'editorconfig', '.editorconfig');
	this.copy(tpl + 'jshintrc', '.jshintrc');

	var clientDir = 'client/';
	var serverDir = 'server/';
	var configDir = serverDir + 'config/';
	var helperDir = serverDir + 'helpers/';
	var modelsDir = serverDir + 'models/';
	var migrationsDir = configDir + 'migrations/';
	var clientLessDir = clientDir + 'styles-less/';
	this.mkdir(serverDir);
	this.mkdir(configDir);
	this.mkdir(helperDir);
	this.mkdir(modelsDir);
	this.mkdir(migrationsDir);
	this.mkdir(clientDir);
	this.mkdir(clientLessDir);

	this.template(tpl + '_composer.json', 'composer.json');
	this.template(tpl + 'server/_app.php', serverDir + 'app.php');
	this.template(tpl + 'server/config/_app.php', configDir + 'app.php');
	this.template(tpl + 'server/config/_phpmig.php', configDir + 'phpmig.php');
	this.template(tpl + 'server/helpers/_validator.php', helperDir + 'validator.php');
	this.template(tpl + 'server/helpers/_restresponse.php', helperDir + 'restresponse.php');
	this.template(tpl + 'client/_index.php', clientDir + 'index.php');
	this.copy(tpl + 'client/htaccess', clientDir + '.htaccess');
	this.copy(tpl + 'client/favicon.ico', clientDir + 'favicon.ico');
	this.copy(tpl + 'client/404.html', clientDir + '404.html');
	this.copy(tpl + 'client/robots.txt', clientDir + 'robots.txt');

	var clientCssDir = clientDir + 'css/';
	var clientJsDir = clientDir + 'js/';
	var clientViewDir = clientDir + 'views/';
	this.mkdir(clientCssDir);
	this.mkdir(clientJsDir);
	this.mkdir(clientViewDir);
	this.copy(tpl + 'client/styles-less/_common.less', clientLessDir + 'common.less');
	this.template(tpl + 'client/styles-less/_app.less', clientLessDir + 'app.less');
	this.template(tpl + 'client/js/_app.js', clientJsDir + 'app.js');
	this.template(tpl + 'client/js/_filters.js', clientJsDir + 'filters.js');
	this.template(tpl + 'client/js/_services.js', clientJsDir + 'services.js');
	this.template(tpl + 'client/js/_directives.js', clientJsDir + 'directives.js');
	this.template(tpl + 'client/js/_controllers.js', clientJsDir + 'controllers.js');

	this.template(tpl + 'client/_index.html', clientDir + 'index.html');
	this.template(tpl + 'client/views/_nav.html', clientViewDir + 'nav.html');
	this.template(tpl + 'client/views/_flash.html', clientViewDir + 'flash.html');
	this.template(tpl + 'client/views/_header.html', clientViewDir + 'header.html');
	this.template(tpl + 'client/js/home/_home-controller.js', clientJsDir + 'home/home-controller.js');
	this.template(tpl + 'client/views/home/_home.html', clientViewDir + 'home/home.html');
	if (this.authenticate) {
		var d = new Date();
		var dateStr = '' + d.getFullYear() + (d.getMonth() + 1) + d.getDate() + d.getHours() + d.getMinutes() + d.getSeconds();
		this.copy(tpl + 'server/models/_AuthToken.php', modelsDir + 'AuthToken.php');
		this.copy(tpl + 'server/models/_Role.php', modelsDir + 'Role.php');
		this.copy(tpl + 'server/models/_User.php', modelsDir + 'User.php');
		this.template(tpl + 'client/views/_signin.html', clientViewDir + 'signin.html');
		this.template(tpl + 'server/config/_authtoken.php', migrationsDir + dateStr + '_CreateAuthToken' + '.php');
	}

	// server/app.php
	this.template(tpl + 'server/_app.php', serverDir + 'app.php');
	// loop all
	_.each(this.entities, function(entity) {
		this.name = entity.name;
		this.attrs = entity.attrs;
		var d = new Date();
		var dateStr = '' + new Date().getTime();
		//d.getFullYear() + (d.getMonth() + 1) + d.getDate() + d.getHours() + d.getMinutes() + d.getSeconds();
		this.template(tpl + 'client/styles-less/_model.less', clientLessDir + entity.name.toLowerCase() + '.less');
		this.template(tpl + 'server/models/_model.php', modelsDir + _s.classify(entity.name) + '.php');
		this.template(tpl + 'server/config/_migration.php', migrationsDir + dateStr + '_Create' + _s.classify(entity.name) + '.php');

		var publicEntityJsDir = clientJsDir + entity.name + '/';
		var publicEntityViewDir = clientViewDir + entity.name + '/';
		this.mkdir(publicEntityJsDir);
		this.mkdir(publicEntityViewDir);

		this.template(tpl + 'client/js/_model-controller.js', publicEntityJsDir + entity.name + '-controller.js');
		this.template(tpl + 'client/js/_model-router.js', publicEntityJsDir + entity.name + '-router.js');
		this.template(tpl + 'client/js/_model-service.js', publicEntityJsDir + entity.name + '-service.js');
		this.template(tpl + 'client/views/_models.html', publicEntityViewDir + pluralize(entity.name) + '.html');
		this.template(tpl + 'client/views/_model-modal.html', publicEntityViewDir + entity.name + '-modal.html');

	}.bind(this));
};
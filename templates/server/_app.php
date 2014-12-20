<?php

if (isset($_SERVER['HTTP_ORIGIN'])) {
	header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
	header('Access-Control-Allow-Credentials: true');
	header('Access-Control-Max-Age: 86400');	 // cache for 1 day
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

	if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
		header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

	if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
		header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

	exit(0);
}


if (!function_exists('getallheaders'))
{
	function getallheaders()
	{
		$headers = '';
		foreach ($_SERVER as $name => $value)
		{
			if (substr($name, 0, 5) == 'HTTP_')
			{
				$headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
			}
		}
		return $headers;
	}
}

require '../vendor/autoload.php';
require 'config/app.php';

<% if (authenticate) { %>
function authenticate($role = 'member') {
	return function () use ($role) {
		$a = getallheaders();
		//$hash = isset($a["authorization"]) ? $a['authorization'] : "";
		foreach ($a as $key => $value) if ($key=="Authorization" || $key=="authorization") $hash = $value;

		if (isset($hash)&&$hash) {
			$authToken = AuthToken::with('user')->find($hash);
			if ($authToken) {
				if (!$authToken->isExpired()) {
					if (!$authToken->user->hasRole($role)){
						$error = "Unauthorized.";
					}
					return $authToken;
				}
				else {
					$error = "Session token has expired.";
				}
			}
			else {
				$error = "Invalid session token.";
			}
		} else {
			$error = "Require Authorization";
		}
		$app = new \Slim\Slim();
		$app->contentType('application/json');
		$resp = new RestResponse(401, $error);
		echo $resp->toJson();
		$app->stop();
	};
};
<% } %>

$app = new \Slim\Slim();

$app->get('/', function() use ($app) {
	$app->contentType('text/html');
	readfile('index.html');
	$app->stop();
});

<% if (authenticate) { %>
$app->group('/<%= baseName %>/auth', function() use ($app) {
	$app->contentType('application/json');
	$app->post('/login', function() use($app) {
		try {
			$request = $app->request();
			$body    = $request->getBody();
			$input   = json_decode($body, true);
			$errors  = array();
			$validator = Validator::make(
				$input,
				array(
					"username" => "required",
					"password" => "required",
				)
			);
			if ($validator->fails()) $errors = array_merge($errors, $validator->messages()->all('<li>:message</li>'));
			if (count($errors) == 0) {
				if ($authToken = AuthToken::login($input["username"], $input["password"])) {
					$app->response->status(201);
					$resp = new RestResponse('200', "Ok", $authToken->toArray());
					echo $resp->toJson();
				}
				else {
					$resp = new RestResponse('401', "Invalid username or password");
					echo $resp->toJson();
				}
			}
			else {
				$resp = new RestResponse('400', $errors);
				echo $resp->toJson();
			}
		} catch (Exception $e) {
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
	});

	$app->post('/logout', function() use($app) {
		try {
			$authToken = App::make('authToken');
			$authToken->expired_at = date('Y-m-d H:i:s');
			$authToken->updated_at = $authToken->expired_at;
			$authToken->save();
			$app->response->status(204);
		} catch (Exception $e) {
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
	});
});
<% } %>

<% _.each(entities, function (entity) { %>

/* begin <%= baseName %>/<%= pluralize(entity.name) %> */
$app->group('/<%= baseName %>',<%= (authenticate)? " authenticate(),":"" %> function () use ($app) {
	// Get ALL <%= pluralize(entity.name) %>
	// 
	$request = $app->request();
	$query   = $request->params("query", '');
	$page    = $request->params("page", 1);
	$limit   = $request->params("limit", 20);
	$order   = $request->params("order", 'id');
	$sort    = $request->params("sort", 'DESC');
	$offset  = ((int)$page -1) * (int)$limit;

	$app->contentType('application/json');
	$app->get('/<%= pluralize(entity.name) %>', function() {
		// $<%= pluralize(entity.name) %> = <%= _.classify(entity.name) %>::all();
		if ($query) {
			<% var concat = []; _.each(entity.attrs, function (attr) {
				if (attr.attrType === "String" || attr.attrType === "Char" || attr.attrType === "Text") {
					concat.push(_.underscored(attr.attrName));
				}
			});
			%>
			$<%= pluralize(entity.name) %> = <%= _.classify(entity.name) %>::whereRaw("CONCAT(<%= concat.join(', ') %>) LIKE ?", array('%'.$query.'%'))->skip($offset)->take($limit)->get();
		}
		else{
			$<%= pluralize(entity.name) %> = <%= _.classify(entity.name) %>::all()->skip($offset)->take($limit)->get();
		}
		echo $<%= pluralize(entity.name) %>->toJson();
	});

	// Create <%= pluralize(entity.name) %>
	$app->post('/<%= pluralize(entity.name) %>',<%= (authenticate)? " authenticate(),":"" %> function() use($app) {
		try {
				$request = $app->request();
				$body    = $request->getBody();
				$input   = json_decode($body, true);
				$errors  = array();
				$validator = Validator::make(
					$input,
					array(<% _.each(entity.attrs, function (attr) {
							if (attr.required||attr.minLength||attr.maxLength||attr.min||attr.max) { 
								var validator="required"; 
								if (attr.attrType === "String") {
									if (attr.minLength){validator += "|min:"+attr.minLength;}
									if (attr.maxLength){validator += "|max:"+attr.maxLength;}                    
								} else if (attr.attrType === "Boolean"){
									validator += "|boolean";
								} else if (attr.attrType === "Date"){
									validator += "|date_format:Y-m-d";
								} else if (attr.attrType === "Enum"){
									validator += "|in:"+attr.enumValues;
								} else if (attr.attrType === "Integer"){
									validator += "|numeric";
									if (attr.min){validator += "|min:"+attr.min;}
									if (attr.max){validator += "|max:"+attr.max;} 
								} else if (attr.attrType === "Float"){
									validator += "|regex:/^[+-]?\d+\.\d+, ?[+-]?\d+\.\d+$/";
								}%>
						"<%= _.underscored(attr.attrName) %>" => "<%= validator %>",<% }}); %>
					)
				);
				if ($validator->fails()) $errors = array_merge($errors, $validator->messages()->all('<li>:message</li>'));
				if (count($errors) == 0) {
					$<%= entity.name %> = new <%= _.classify(entity.name) %>;
					<% _.each(entity.attrs, function (attr) { %>
					$<%= entity.name%>-><%= _.underscored(attr.attrName) %> = isset($input['<%= _.underscored(attr.attrName) %>'])?$input['<%= _.underscored(attr.attrName) %>']:NULL;<% }); %>
					$<%= entity.name %>->save();
					$app->response->status(201);
					echo $<%= entity.name %>->toJson();
				}
				else echo json_encode(array("code" => 400, "message" => $errors));
		} catch (Exception $e) {
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
	});

	// Get <%= pluralize(entity.name) %> with ID
	$app->get('/<%= pluralize(entity.name) %>/:id',<%= (authenticate)? " authenticate(),":"" %> function($id) use($app) {
		$<%= entity.name %> = <%= _.classify(entity.name) %>::find($id);
		if (is_null($<%= entity.name %>)) {
			$app->response->status(404);
			$app->stop();
		}
		echo $<%= entity.name %>->toJson();
	})->conditions(array('id' => '[0-9]+'));

	// Update <%= pluralize(entity.name) %> with ID
	$app->put('/<%= pluralize(entity.name) %>/:id', function($id) use($app) {
		try {
			$request = $app->request();
			$body    = $request->getBody();
			$input   = json_decode($body, true);
			$<%= entity.name %> = <%= _.classify(entity.name) %>::find($id);
			if (is_null($<%= entity.name %>)) {
				$app->response->status(404);
				$app->stop();
			}
			$errors = array();
			$validator = Validator::make(
				$input,
				array(<% _.each(entity.attrs, function (attr) {
						if (attr.required||attr.minLength||attr.maxLength||attr.min||attr.max) {
							var validator="required"; 
							if (attr.attrType === "String") {
								if (attr.minLength){validator += "|min:"+attr.minLength;}
								if (attr.maxLength){validator += "|max:"+attr.maxLength;}                    
							} else if (attr.attrType === "Boolean"){
								validator += "|boolean";
							} else if (attr.attrType === "Date"){
								validator += "|date_format:Y-m-d";
							} else if (attr.attrType === "Enum"){
								validator += "|in:"+attr.enumValues;
							} else if (attr.attrType === "Integer"){
								validator += "|numeric";
								if (attr.min){validator += "|min:"+attr.min;}
								if (attr.max){validator += "|max:"+attr.max;} 
							} else if (attr.attrType === "Float"){
								validator += "|regex:/^[+-]?\d+\.\d+, ?[+-]?\d+\.\d+$/";
							}%>
					"<%= _.underscored(attr.attrName) %>" => "<%= validator %>",<% }}); %>
				)
			);
			if ($validator->fails()) $errors = array_merge($errors, $validator->messages()->all('<li>:message</li>'));
			if (count($errors) == 0) {
				<% _.each(entity.attrs, function (attr) { %>
				$<%= entity.name%>-><%= _.underscored(attr.attrName) %> = isset($input['<%= _.underscored(attr.attrName) %>'])?$input['<%= _.underscored(attr.attrName) %>']:$<%= entity.name%>-><%= _.underscored(attr.attrName) %>;<% }); %>
				$<%= entity.name %>->save();
				$app->response->status(201);
				echo $<%= entity.name %>->toJson();
			}
			else echo json_encode(array("code" => 400, "message" => $errors));

		} catch (Exception $e) {
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
	})->conditions(array('id' => '[0-9]+'));

	// Delete <%= pluralize(entity.name) %> with ID
	$app->delete('/<%= pluralize(entity.name) %>/:id',<%= (authenticate)? " authenticate(),":"" %> function($id) use($app) {
		try {
			$<%= entity.name %> = <%= _.classify(entity.name) %>::find($id);
			if (is_null($<%= entity.name %>)) {
				$app->response->status(404);
				$app->stop();
			}
			$<%= entity.name %>->delete();
			$app->response->status(204);

		} catch (Exception $e) {
			$app->response()->status(400);
			$app->response()->header('X-Status-Reason', $e->getMessage());
		}
	})->conditions(array('id' => '[0-9]+'));
});
/* end <%= baseName %>/<%= pluralize(entity.name) %> */
<% }); %>
$app->run();
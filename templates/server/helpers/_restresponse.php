<?php

class RestResponse {
	public $code;
	public $message;
	public $payload;

	public function __construct($code = "200", $message = "", $payload = "") {
		$this->code = $code;
		switch ($code) {
			case "200":
				if ($message == "") {
					$message = "OK";
				}
				break;
			case "302":
				if ($message == "") {
					$message = "Redirect";
				}
				break;
			case "400":
				if ($message == "") {
					$message = "Bad Request";
				}
				break;
			case "401":
				if ($message == "") {
					$message = "Unauthorized";
				}
				break;
			case "403":
				if ($message == "") {
					$message = "Forbidden";
				}
				break;
			case "404":
				break;
			case "500":
				break;
			default:
				throw new Exception("Exception: Status not supported.");
			break;
		}
		$this->message = $message;
		$this->payload = $payload;
	}

	public function toJSON() {
		return json_encode($this);
	}
}
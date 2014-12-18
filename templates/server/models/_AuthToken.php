<?php
/**
 * AuthToken Model 
 */
class AuthToken extends Illuminate\Database\Eloquent\Model {
	protected $table = 'auth_token';

	protected $fillable = array('id');
	public $incrementing = false;

	/**
	 * [loginAsUser description]
	 * @param  [integer] $id
	 * @return [object] $AuthToken
	 */
	public static function loginAsUser($id)
	{
		$user = User::find($id);

		if ($user) {
			$authToken = new AuthToken();
			$authToken->id = md5(time() + $user->email + $user->password);
			$authToken->user_id = $user->id;
			$authToken->data = serialize(array());
			$authToken->expired_at = date('Y-m-d H:i:s', strtotime("+ 24 hours"));
			$authToken->save();

			return $authToken;
		} else {
			return null;
		}
	}


	/**
	 * [login description]
	 * @param  [string][email|phone|username] $username
	 * @param  [string] $password
	 * @return [object] $AuthToken
	 */
	public static function login($username, $password)
	{
		$userCredential = User::where('username', $username)->first();

		if ($userCredential && ($userCredential->password==md5($password))) {
			$authToken = new AuthToken();
			$authToken->id = md5(time() + $username + $password);
			$authToken->user_id = $userCredential->user_id;
			$authToken->data = serialize(array());
			$authToken->expired_at = date('Y-m-d H:i:s', strtotime("+ 24 hours"));
			$authToken->save();

			return $authToken;
		} else {
			return null;
		}
	}

	/**
	 * [user description]
	 * @return [object] User
	 */
	public function user() {
		return $this->belongsTo('User');
	}

	/**
	 * [isExpired description]
	 * @return boolean
	 */
	public function isExpired() {
		$now = time();
		$expired_at = strtotime($this->expired_at);
		if ($now > $expired_at) {
			return true;
		}

		return false;
	}

	/**
	 * [extendExpiry description]
	 * @return none
	 */
	public function extendExpiry() {
		$this->expired_at = date('Y-m-d H:i:s', strtotime("+ 24 hours"));
		$this->save();
	}

	/**
	 * [facebookLogin description]
	 * @param  [integer] $facebook_id
	 * @return [object]	AuthToken
	 */
    public static function facebookLogin($facebook_id)
    {
        $facebookCredential = UserFacebookCredential::where('facebook_id', $facebook_id)->first();

        if ($facebookCredential) {
            $authToken = new AuthToken();
            $authToken->id = md5(time() + $facebookCredential->access_token);
            $authToken->user_id = $facebookCredential->user_id;
            $authToken->data = serialize(array());
            $authToken->expired_at = date('Y-m-d H:i:s', strtotime("+ 24 hours"));
            $authToken->save();

            return $authToken;
        } else {
            return null;
        }
    }

    /**
     * [twitterLogin description]
     * @param  [integer] $twitter_id
     * @return [object]	AuthToken
     */
    public static function twitterLogin($twitter_id)
    {
        $twitterCredential = UserTwitterCredential::where('twitter_id', $twitter_id)->first();

        if ($twitterCredential) {
            $authToken = new AuthToken();
            $authToken->id = md5(time() + $twitterCredential->access_token);
            $authToken->user_id = $twitterCredential->user_id;
            $authToken->data = serialize(array());
            $authToken->expired_at = date('Y-m-d H:i:s', strtotime("+ 24 hours"));
            $authToken->save();

            return $authToken;
        } else {
            return null;
        }
    }
}
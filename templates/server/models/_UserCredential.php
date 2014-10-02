<?php

class UserCredential extends Illuminate\Database\Eloquent\Model {

	/**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'users_credentials';
	protected $hidden = array('password');
    protected $fillable = array('user_id', 'username', 'password');

    public function user()
    {
        return $this->belongsTo('User');
    }

}
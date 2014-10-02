<?php

class Role extends Illuminate\Database\Eloquent\Model {

	/**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'roles';
	protected $fillable = array('name');

	public function users()
    {
        return $this->belongsToMany('User');
    }

}
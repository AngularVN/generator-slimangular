<?php

class User extends Illuminate\Database\Eloquent\Model {

	/**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'users';

	protected $softDelete = true;
	protected $hidden = array('deleted_at');

	public function roles()
	{
		return $this->belongsToMany('Role');
	}

	public function hasRole($check)
	{
		return in_array($check, array_fetch($this->roles->toArray(), 'name'));
	}

	public function getRoles()
	{
		return array_fetch($this->roles->toArray(), 'id');
	}

	public function addRole($key_roles = array())
	{
		$key_roles = is_array($key_roles)?$key_roles: array($key_roles);
		$roles = array_fetch(Role::all()->toArray(), 'id');
		$this->roles()->sync(array_intersect($roles, $key_roles));
	}

	public function isAdmin($role = 'admin') {
		return $this->hasRole($role);
	}

	public function isMod($role = 'mod') {
		return $this->hasRole($role)||$this->isAdmin;
	}

	public function isOwner($id = 0) {
		return (($id === $this->id)||$this->isMod);
	}

	public function getRememberToken()
	{
		return $this->remember_token;
	}

	public function setRememberToken($value)
	{
		$this->remember_token = $value;
	}

	public function getRememberTokenName()
	{
		return 'remember_token';
	}
}

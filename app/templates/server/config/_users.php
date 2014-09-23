<?php

use Phpmig\Migration\Migration;

class CreateUsers extends Migration
{
    protected $tableName;

    /* @var \Illuminate\Database\Schema\Builder $schema */
    protected $schema;

    public function init()
    {
        $this->tableName = 'users';
        $this->schema = $this->get('schema');
    }

    /**
     * Do the migration
     */
    public function up()
    {
        /* @var \Illuminate\Database\Schema\Blueprint $table */
        $this->schema->create("users", function ($table)
        {
            $table->engine = 'InnoDB';
            
			$table->increments('id')->unsigned();
			$table->boolean('remember_token')->default(false);
			$table->enum('status', array('pending', 'active', 'inactive', 'banned'))->default('pending');
        });
    }

    /**
     * Undo the migration
     */
    public function down()
    {
        $this->schema->drop($this->tableName);
    }
}

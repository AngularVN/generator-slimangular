<?php

use Phpmig\Migration\Migration;

class CreateAuthToken extends Migration
{
    protected $schema;

    public function init()
    {
        $this->schema = $this->get('schema');
    }

    /**
     * Do the migration
     */
    public function up()
    {

        $this->schema->create("users", function ($table)
        {
            $table->engine = 'InnoDB';
            
            $table->increments('id')->unsigned();
            $table->string('username')->unique();
            $table->string('password', 32);
            $table->enum('status', array('pending', 'active', 'inactive', 'banned'))->default('pending');
        });

        $this->schema->create('roles', function ($table)
        {
            $table->engine = 'InnoDB';
            $table->increments('id')->unsigned();
            $table->string('name', 16)->unique();
            $table->string('description', 128);
            $table->timestamps();
        });

        $this->schema->create('role_user', function ($table)
        {
            //
            $table->engine = 'InnoDB';

            $table->integer('user_id')->unsigned();
            $table->integer('role_id')->unsigned();
            $table->unique(array('user_id', 'role_id'));
        });

        $this->schema->create("auth_token", function ($table)
        {
            $table->engine = 'InnoDB';
            $table->string('id', 32)->primary();
            $table->integer('user_id')->unsigned();
            $table->text('data');
            $table->timestamp('expired_at')->default('0000-00-00 00:00:00');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Undo the migration
     */
    public function down()
    {
        $this->schema->drop("roles");
        $this->schema->drop("users");
        $this->schema->drop("role_user");
        $this->schema->drop("auth_token");
    }
}

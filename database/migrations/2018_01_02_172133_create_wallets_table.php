<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateWalletsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->increments('id');
            $table->timestamps();
            $table->longText('wallet');
            $table->longText('wallet_backup');
            $table->string('identifier', 128)->unique();
            $table->string('alias', 255)->unique()->nullable();
            $table->string('email', 255);
            $table->boolean('confirmed')->default(false);
            $table->integer('sign_out')->default(30);
            $table->boolean('_2fa')->default(false);
            $table->string('_2fa_key', 255)->unique()->nullable();
            $table->bigInteger('last2fa')->default(0);
            $table->string('login_key_hash', 128)->nullable();
            $table->string('login_key_salt', 16)->nullable();
            $table->boolean('login_key_enabled')->default(false);
            $table->boolean('legacy')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('wallets');
    }
}

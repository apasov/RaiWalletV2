<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePowTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('PoW', function (Blueprint $table) {
            $table->increments('id');
            $table->timestamps();
            $table->unsignedInteger('wallet_id');
            $table->string('hash', 64)->unique();
            $table->string('work', 16)->nullable();
            $table->boolean('worked')->default(false);
            $table->bigInteger('time_finished')->nullable();
            $table->boolean('locked')->default(false);
            $table->string('rand_id', 64)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('PoW');
    }
}

<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePaymentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('Payments', function (Blueprint $table) {
            $table->increments('id');
            $table->timestamps();
            $table->string('publicKey', 255);
            $table->string('reference', 255);
            $table->integer('amountUSDCents')->default(0);
            $table->integer('amountUSDCentsAP')->nullable();
            $table->unsignedBigInteger('amountRai')->default(0);
            $table->string('payment_account', 255);
            $table->string('merchant_account', 255)->nullable();
            $table->string('APtoken', 255)->unique();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('Payments');
    }
}

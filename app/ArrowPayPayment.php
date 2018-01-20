<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ArrowPayPayment extends Model
{
    protected $connection = 'arrowpay';
    protected $table = 'payments';
}

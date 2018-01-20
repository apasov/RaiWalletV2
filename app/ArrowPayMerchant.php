<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ArrowPayMerchant extends Model
{
    protected $connection = "arrowpay";
    protected $table = "shops";
}

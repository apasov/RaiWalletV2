<?php

namespace App\Http\Controllers\Auth;

use App\Wallet;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Foundation\Auth\RegistersUsers;

class RegisterController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Register Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users as well as their
    | validation and creation. By default this controller uses a trait to
    | provide this functionality without requiring any additional code.
    |
    */

    use RegistersUsers;

    /**
     * Where to redirect users after registration.
     *
     * @var string
     */
    protected $redirectTo = '/home';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest');
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data)
    {
        return Validator::make($data, [
            'wallet' => 'required|string',
            'email' => 'required|string|email|max:255',
            'loginKey' => 'required|string'
        ]);
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return \App\Wallet
     */
    protected function create(array $data)
    {
        // generate unique identifier for the wallet
        $identifier = substr('id_' . hash('sha256', $data['email'] . $data['wallet'] . time()), 0, 64 - 3);
        $w = new Wallet();
        $w->identifier = $identifier;
        $w->wallet = $data['wallet'];
        $w->wallet_backup = $data['wallet'];
        $w->email = $data['email'];
        $w->login_key = $data['loginKey'];
        return $w;
    }
}

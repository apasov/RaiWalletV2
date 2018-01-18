<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

use Symfony\Component\HttpFoundation\Cookie;

use App\Payment;
use App\Wallet;
use App\Custom\RaiNode;

use Mail;
use App\Mail\PaymentMail;


class PaymentsController extends Controller
{
	protected $cookies = [];
	
	protected function validateBlockHash($hash)
    {
        if(strlen($hash) != 64)
            return false;
        if(!hex2bin($hash))
            return false;
        return true;
    }
    
    protected function success($data = [])
    {
        if(!is_array($data))
            $data = [$data];
        $data = array_merge(['status' => 'success'], $data);
        $res = response()->json($data);
        if(count($this->cookies) > 0)
            foreach($this->cookies as $cookie)
                $res->cookie($cookie);
        return $res;
    }
    
    protected function errorView($msg)
    {
        return response()->view('error', '', ['msg' => $msg]);
    }
    
    protected function error($msg)
    {
        return response()->json(['status' => 'error', 'msg' => $msg]);
    }
    
    public function create(Request $request)
    {
    	$valid = Validator::make($request->all(), [
    		'invoiceId' => 'string|nullable',
    		'amount' => 'required|numeric',
    		'publicKey' => 'required|string|regex:/^public_[0-9a-zA-Z-_]$/',
    		'companyName' => 'required|string|regex:/^[0-9a-zA-Z-_ ]$/',
    		'product' => 'string|nullable|regex:/^[0-9a-zA-Z-_ ]$/',
    	]);
    	if(!$valid)	
    		return $this->errorView('Invalid parameters.');
    	
    	if($request->amount < 0)
    		return $this->errorView('Invalid amount.');
    		
    	// request payment at arrowpay
    	$paymentRequest = [
    		'itemId' => $request->itemId,
    		'amount' => $request->amount,
    		'publicKey' => $request->publicKey
    	];
    	
    	$client = new \GuzzleHttp\Client();
    	$res = $client->post('https://arrowpay.io/api/payment/start', [
		    \GuzzleHttp\RequestOptions::JSON => $paymentRequest
		]);
		if($res->getStatusCode() != 200)
			return $this->errorView('Error connecting to ArrowPay.io. Try again later.');

		$json = $res->getBody();
		$json = json_decode($json);
	
    	$payment = new Payment();
    	$payment->publicKey = $request->publicKey;
    	$payment->reference = $request->invoiceId;
    	$payment->amountUSDCents = $request->amount * 100; 
    	$payment->payment_account = $json->accountToPay;
    	$payment->amountUSDCentsAP = $json->amountUSD;
    	$payment->APtoken = $json->token;
		
    	$data = new \stdClass();
    	$data->companyName = $request->companyName; // escape
    	$data->amountUSD = number_format($json->amountUSD / 100, 2);
    	$data->amountXRB = number_format($json->amountXRB, 6);
    	$data->product = $request->product;
    	$data->reference = $request->invoiceId;
        $data->address = $json->accountToPay;

    	$user = new \stdClass();
    	$user->identifier = null;
    	if($request->cookie('wallet_token'))
    	{
    		// get user identifier
    		$wallet = Wallet::where('cookie_token', $request->cookie('wallet_token'))->first();
    		if($wallet) 
    		{
    			$user->identifier = $wallet->identifier;
    		
	    		// refresh token
	    		$wallet_token = hash('sha256', time() . $wallet->identifier);
			    $wallet->cookie_token = $wallet_token;
			    $wallet->save();
			    $cookie = cookie('wallet_token', $wallet_token, 60 * 24 * 90, null, '.raiwallet.com');
    		}
    	}
    	
    	$request->session()->put('paymentData', $data);
    	$res = response()->view('paymentHorizontal', ['user' => $user, 'data' => $data]);
    	if(isset($cookie))
    		$res->cookie($cookie);
    	return $res;
    }
    
    public function workAndBroadcast(Request $request)
    {
        if(!$this->validateBlockHash($request->hash))
            return $this->error('Invalid block hash.');
        
        $blk = json_decode($request->block);
        if(!$blk)
            return $this->error('Invalid block data.');
        
        if(!$blk->previous || !$this->validateBlockHash($blk->previous))
            return $this->error('Invalid previous block hash.');
        
        $node = new RaiNode();
        $work = $node->work_generate(['hash' => $blk->previous])['work'];
        $blk->work = $work;
        
        $blk = json_encode($blk);
        $res = $node->process(['block' => $blk]);
        
        if(isset($res['error']))
            return $this->error($res['error']);
            
        if($request->sendMail == 'on')
        {
        	// send email with payment details
        	$wallet = Auth::user();
        	$paymentData = $request->session()->pull('paymentData');
        	$paymentData->hash = $request->hash;
        	Mail::to($wallet->email)->send(new PaymentMail($paymentData));
        }
        
        return $this->success();
    }
}

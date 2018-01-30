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
use App\ArrowPayPayment;
use App\ArrowPayMerchant;

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
        return response()->view('error', ['msg' => $msg]);
    }
    
    protected function error($msg)
    {
        return response()->json(['status' => 'error', 'msg' => $msg]);
    }
    
    public function create(Request $request)
    {
        $valid = Validator::make($request->all(), [
            'token' => 'string|required|regex:/[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/'
        ]);
    	if(!$valid)	
    		return $this->errorView('Invalid parameters.');
    	
        
        // retrieve data
        $APPayment = ArrowPayPayment::where('id', $request->token)->first();
        
        if(!$APPayment)
            return $this->errorView('This invoice does not exist');
        $APMerchant = ArrowPayMerchant::where('id', $APPayment->owner)->first();
        
        if($APPayment->completed_at)
            return $this->errorView('This invoice has already been paid.');
        if($APPayment->closed)
            return $this->errorView('This invoice expired.');

    	$payment = new Payment();
    	$payment->publicKey = $APMerchant->public_key;
    	$payment->reference = $APPayment->item_id ? $APPayment->item_id : $APPayment->id;
    	$payment->amountUSDCents = $APPayment->amount_XRB * $APPayment->exchange_xrb_usd * 100; 
    	$payment->payment_account = $APPayment->account_to;
    	$payment->amountUSDCentsAP = $payment->amountUSDCents;
    	$payment->APtoken = $request->token;
    	
    	if(!Payment::where('APtoken', $request->token)->first())
            $payment->save();
		
    	$data = new \stdClass();
    	$data->companyName = $APMerchant->name;
    	$data->amountUSD = number_format($payment->amountUSDCents / 100, 2);
    	$data->amountXRB = number_format($APPayment->amount_XRB, 6);
    	$data->description = $APPayment->description;
    	$data->reference = $APPayment->item_id;
        $data->address = $APPayment->account_to;

    	$user = new \stdClass();
    	$user->identifier = null;
    	if($request->cookie('wallet_token'))
    	{
    		// get user identifier
    		$wallet = Wallet::where('cookie_token', $request->cookie('wallet_token'))->first();
    		if($wallet) 
    		{
    			$user->identifier = $wallet->alias ? $wallet->alias : $wallet->identifier;
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

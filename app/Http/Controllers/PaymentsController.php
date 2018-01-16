<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Validator;
use App\Payment;


class PaymentsController extends Controller
{
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
    		return response()->view('error', '', ['msg' => 'Invalid parameters.']);
    	
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
			return response()->view('error', ['msg' => 'Error connecting to ArrowPay.io. Try again later.']);
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

    	$user = new \stdClass();
    	$user->identifier = null;
    	if($request->cookie('wallet_token'))
    	{
    		// get user identifier
    	}
    	return response()->view('paymentHorizontal', ['user' => $user, 'data' => $data]);
    }
}

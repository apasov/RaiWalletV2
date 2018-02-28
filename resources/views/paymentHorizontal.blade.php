
@extends('layouts.pay')

@section('content')
    <div class="container main-container">
        <div class="row">
            <div class="col-sm-2"></div>
            <div class="col-sm-8 login-square">
                <div>
                    <div class="col-sm-5">
                        <div class="row">
                            <div class="col-xs-8">
                                <img src="apple-icon.png" class="img-responsive pay-logo" />
                                <h3 class="logo-name">NANOWALLET</h3>
                            </div>
                            <div class="col-xs-4">
                                <p class="price">
                                    <i class="fa fa-shopping-cart" aria-hidden="true"></i>
                                    {{$data->amountUSD}}USD
                                </p>
                            </div>
                        </div>
                        <hr/>
                        <div class="row">
                            <div class="col-xs-12 payment-description">
                                <h4>{{$data->companyName}}</h4>
                                <ul>
                                    <li><span class="boldy">Item:</span> {{$data->reference}}</li>
                                    <li><span class="boldy">Price:</span> {{$data->amountUSD}}</li>
                                    @if($data->description)
                                    <li><span class="boldy">Description:</span> {{$data->description}}</li>
                                    @endif
                                </ul>
                                <hr class="hr-1"/>
                                <p>
                                    <b>Total</b> <span style="float:right">{{$data->amountUSD}}USD ~ {{$data->amountXRB}} NANO</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-7 pay-form">
                        <h3 id="pay-title">Pay with NanoWallet</h3>
                        <form method="post" id="login-form">
                            <div class="form-group">
                                <input type="text" id="identifier" name="identifier" class="form-control" placeholder="Alias or Identifier"  value="{{$user->identifier}}" />
                            </div>
                            <div class="form-group">
                                <input type="password" id="password" name="password" class="form-control" placeholder="Password" />
                            </div>
                            <div class="form-group" id="_2fa_input">
                                <input type="text" id="2fa_login_code" name="password" class="form-control" placeholder="2FA OTP e.g.: 123456" />
                            </div>
                            <div class="form-group">
                                <button type="button" name="login" id="pay-login-button" class="btn btn-primary form-control">
                                    Log In
                                </button>
                            </div>
                            <div class="form-group">
                                <input type="button" name="register" style="font-weight: 300" class="btn btn-default form-control" value="Or create a new wallet" onclick="location.href='https://nanowallet.io'" />
                            </div>
                        </form>
                        <form method="post" id="pay-form" hidden>
                            <input type="hidden" value="{{$data->address}}" name="pay_address" class="form-control" id="pay_address" readonly />
                            <div class="form-group">
                                <input type="text" value="{{$data->amountXRB}}" id="pay_amount" name="pay_amount" value="" class="form-control" readonly />
                            </div>
                            <div class="form-group">
                                <select class="pay-account-select form-control">
                                    <option value="" disabled selected>Select from which account you want to pay ... </option>
                                </select>
                            </div>
                            <div class="form-group">
                                <input type="checkbox" name="email-notification" id="email-checkbox" checked /> Send me an email with the payment details!
                            </div>
                            <div class="form-group">
                                <input type="button" name="pay" id="confirm-pay" class="btn btn-primary form-control" value="Confirm Payment"/>
                            </div>
                        </form>
                        <div class="pay-success text-center" hidden>
                            <h4>Payment successful!</h4>
                            <i class="fa fa-check-square-o" aria-hidden="true"></i>
                            <h6><a href="" target="_blank" id="hash_link"></a></h6>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

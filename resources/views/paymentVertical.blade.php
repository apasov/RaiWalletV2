
@extends('layouts.pay')

@section('content')
    <div class="container main-container">
        <div class="row">
            <div class="col-sm-1"></div>
            <div class="col-sm-10 login-square">
                <div>
                    <div class="col-lg-5">
                        <div class="row">
                            <div class="col-xs-8">
                                <img src="img/raiwalletlogo.png" class="img-responsive pay-logo" />
                                <h3 class="logo-name">RAIWALLET</h3>
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
                                    <li><span class="boldy">Item:</span> {{$data->product}}</li>
                                    <li><span class="boldy">Amount:</span> {{$data->amountUSD}}</li>
                                    @if($data->reference)
                                    <li><span class="boldy">Reference:</span> {{$data->reference}}</li>
                                    @endif
                                </ul>
                                <hr class="hr-1"/>
                                <p>
                                    <b>Total</b> <span style="float:right">{{$data->amountUSD}}USD ~ {{$data->amountXRB}} NANO</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-7 pay-form">
                        <h3>Pay with RaiWallet</h3>
                        <form method="post">
                            <div class="form-group">
                                <input type="text" id="identifier" name="identifier" class="form-control" placeholder="Alias or Identifier"  value="{{$user->identifier}}" />
                            </div>
                            <div class="form-group">
                                <input type="password" id="password" name="password" class="form-control" placeholder="Password" />
                            </div>
                            <div class="form-group">
                                <input type="submit" name="login" class="btn btn-primary form-control" value="Log In"/>
                            </div>
                            <div class="form-group">
                                <input type="button" name="register" style="font-weight: 300" class="btn btn-default form-control" value="Or create a new wallet" />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

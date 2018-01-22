
@extends('layouts.pay')

@section('content')
    <div class="container main-container">
        <div class="row">
            <div class="col-sm-2"></div>
            <div class="col-sm-8 login-square">
                <div>
                    <div class="col-sm-12">
                        <div class="row">
                            <div class="col-xs-8">
                                <img src="img/raiwalletlogo.png" class="img-responsive pay-logo" />
                                <h3 class="logo-name">RAIWALLET</h3>
                            </div>
                        </div>
                        <hr/>
                        <div class="row">
                            <div class="col-xs-12 payment-description">
                                <h3>Oooops...</h3>
                                <h4>{{$msg}}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

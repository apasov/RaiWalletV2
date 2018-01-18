
@extends('layouts.pay')

@section('content')
    <div class="container main-container">
        <div class="row">
            <div class="col-sm-1"></div>
            <div class="col-sm-10 login-square">
                <div>
                    <div class="col-lg-12">
                        <div class="row">
                            <div class="col-xs-12">
                                <form method="post" action="https://pay.raiwallet.com" style="text-align:center">
                                    <input type="hidden" name="publicKey" value="public_7131461b-e241-48c6-a198-a925d09bf907" />
                                    <input type="hidden" name="itemId" value="0000" />
                                    <input type="hidden" name="invoiceId" value="id.1000" />
                                    <input type="hidden" name="companyName" value="raiwallet llc" />
                                    <input type="hidden" name="product" value="Amazing item name" />
                                    <input type="hidden" name="amount" value="2" />
                                    <button type="submit" class="btn-default btn">
                                        <img src="img/raiwalletlogo.png" class="img-responsive pay-logo" />
                                        <h3 class="logo-name">RaiWallet Pay</h3>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

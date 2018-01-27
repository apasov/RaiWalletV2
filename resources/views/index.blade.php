
@extends('layouts.app')

@section('content')
        <header>
            <div class="overlay">
                <div class="header-content">
                    <div class="header-content-inner">
                        <h1 id="homeHeading">Create your Nano web wallet</h1>
                        <hr>
                        <p>
                            NanoWallet.io is the first Nano light wallet which keeps you in control of your private keys.
                            There's no need to download the ledger to be in control over your money.
                        </p>
                        <a href="#about" class="btn btn-primary btn-xl page-scroll">Find Out More</a>
                    </div>
                </div>
            </div>
        </header>
    
        <section class="bg-logo" id="about">
            <div class="container">
                <div class="row">
                    <div class="col-lg-8 col-lg-offset-2 text-center">
                        <h2 class="section-heading">We've got what you need!</h2>
                        <hr class="light">
                        <p class="text-faded">
                            Don't wait for the wallet to sync to be able to make transactions. Send and receive payments from anywhere.
                            Import or export your wallet from the official Nano implementation.
                            All this without letting anyone know your keys, you are the only owner of your money.
                        </p>
                        <a href="#services" class="page-scroll btn btn-default btn-xl sr-button">Get Started!</a>
                    </div>
                </div>
            </div>
        </section>
    
        <section id="services">
            <div class="container">
                <div class="row">
                    <div class="col-lg-12 text-center">
                        <h2 class="section-heading-dark">Still here?</h2>
                        <hr class="primary">
                    </div>
                </div>
            </div>
            <div class="container">
                <div class="row">
                    <div class="col-lg-3 col-md-6 text-center">
                        <div class="service-box">
                            <i class="fa fa-4x fa-lock text-primary sr-icons"></i>
                            <h3>Your keys are safe</h3>
                            <p class="text-muted">
                                Wallets are encrypted before being sent to the server. You are the only one who can see your keys.
                            </p>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6 text-center">
                        <div class="service-box">
                            <i class="fa fa-4x fa-paper-plane text-primary sr-icons"></i>
                            <h3>Start right now</h3>
                            <p class="text-muted">You can start sending and receiving payments in just 30 seconds!</p>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6 text-center">
                        <div class="service-box">
                            <i class="fa fa-4x fa-search text-primary sr-icons"></i>
                            <h3>Open Source</h3>
                            <p class="text-muted">Our code is available for all at GitHub. Anyone can inspect it, review it or improve it.</p>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-6 text-center">
                        <div class="service-box">
                            <i class="fa fa-4x fa-globe text-primary sr-icons"></i>
                            <h3>Use it anywhere</h3>
                            <p class="text-muted">At home, in the street, on the mobile or computer... make XRB transactions where you need to!</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    
        <aside class="bg-dark">
            <div class="overlay2">
                <div class="container text-center">
                    <div class="call-to-action">
                        <h2>What are you waiting for?</h2>
                        <button class="btn btn-default btn-xl sr-button signup">Sign Up Now!</button>
                    </div>
                </div>
            </div>
        </aside>

        <section id="contact">
            <div class="container">
                <div class="row">
                    <div class="col-lg-8 col-lg-offset-2 text-center">
                        <h2 class="section-heading-dark">Let's Get In Touch!</h2>
                        <hr class="primary">
                        <p>Do you want to tell us anything? Feel free to do so :)</p>
                    </div>
                    <div class="col-lg-8 col-lg-offset-2 text-center">
                        <i class="fa fa-envelope-o fa-3x sr-contact"></i>
                        <p style="overflow:hidden">
                            <a href="mailto:support@nanowallet.io">support@nanowallet.io</a><br/> 
                            You are also invited to donate something :) <br/>
                            xrb_1ma5dct7jdc8o45135xbr1bwbsixr47xugisu5fnwo69byhcno5u946smqfp 
                        </p>
                    </div>
                </div>
            </div>
        </section>
@endsection

@section('wallet')
    @yield('layouts.wallet')
@endsection

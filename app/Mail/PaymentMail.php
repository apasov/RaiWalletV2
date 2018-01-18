<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class PaymentMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($paymentData)
    {
        $this->paymentData = $paymentData;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->view('emails.paymentConfirmation')
                    ->from('support@raiwallet.com', 'RaiWallet Support')
                    ->subject('RaiWallet Payments Details')
                    ->with(['data' => $this->paymentData]);
    }
}

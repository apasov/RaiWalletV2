<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class RegistrationMail extends Mailable
{
    use Queueable, SerializesModels;
    
    private $identifier;
    
    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($identifier)
    {
        $this->identifier = $identifier;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->view('emails.registration')
                    ->from('support@nanowallet.io', 'NanoWallet Support')
                    ->subject('Welcome to NanoWallet.io')
                    ->with(['identifier' => $this->identifier]);
    }
}

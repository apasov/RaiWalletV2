<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class RecoveryMail extends Mailable
{
    use Queueable, SerializesModels;

    private $identifiers;
    
    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct($identifiers)
    {
        $this->identifiers = $identifiers;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->view('emails.recovery')
                    ->from('support@nanowallet.io', 'NanoWallet Support')
                    ->subject('NanoWallet Recovery Email')
                    ->with(['identifiers' => $this->identifiers]);
    }
}

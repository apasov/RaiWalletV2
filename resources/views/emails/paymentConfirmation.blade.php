
<html>
  <head>
    <style>
      .boldy{
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <div style="width:100%; height:100%; margin:0; padding:0">
      <h1>
        Your Last Payment Details
      </h1>
      <p style="text-align:left">
        You are receiving this email because you requested to receive your last payment details. Here they are:<br/><br/>
        
        <h4>Purchase at {{$data->companyName}}</h4>
        <ul>
            <li><span class="boldy">Item:</span> {{$data->reference}}</li>
            <li><span class="boldy">Price:</span> {{$data->amountUSD}}</li>
            @if($data->description)
            <li><span class="boldy">Description:</span> {{$data->description}}</li>
            @endif
            <li><span class="boldy">Transaction hash:</span> {{ $data->hash }}</li>
        </ul>
        <hr class="hr-1"/>
        <p>
            <b>Total</b> <span style="float:right">{{$data->amountUSD}}USD ~ {{$data->amountXRB}} NANO</span>
        </p>
        <br/><br/>
        
        If you need anything you can contact us at support@nanowallet.io.<br/><br/>
        Sincerely,<br/>
        NanoWallet.io Team.
      </p>
    </div>
  </body>
</html>
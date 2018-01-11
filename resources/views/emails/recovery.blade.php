
<html>
  <head></head>
  <body>
    <div style="width:100%; height:100%; margin:0; padding:0">
      <h1>
        RaiWallet Recovery Email
      </h1>
      <p style="text-align:left">
        You receive this email because you requested to recover your wallet identifier.<br/><br/>
        
        To login, you are going to need your wallet identifier, this is/are: <br/>
        
        @foreach($identifiers as $wid)
          <code>{{ $wid }}</code><br/><br/>
        @endforeach
        
        <br/><br/>
        So yeah! If you need anything you can contact us at support@raiwallet.com.<br/><br/>
        Sincerely,<br/>
        RaiWallet Team.
      </p>
    </div>
  </body>
</html>
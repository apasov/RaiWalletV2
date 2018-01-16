
var rai_wallet = require('rai-wallet');
var RaiWallet = rai_wallet.Wallet;
var RaiBlock = rai_wallet.Block;
var functions = rai_wallet.functions;
var cipher;
var identifier;

$(document).ready(function() {
	
	// alerts
	function toast(title, msg)
	{
		$.toast({
			heading: title,
			text: msg,
			position: 'bottom-right',
			stack: false,
			hideAfter: 10000,
			loader: false
		});
	}
	
	function alertError(msg)
	{
		$.toast({
			heading: 'Error',
			text: msg,
			icon: 'error',
			position: 'bottom-right',
			hideAfter: 10000,
			loader: false
		})
	}
	
	function alertSuccess(msg)
	{
		$.toast({
			heading: 'Success',
			text: msg,
			icon: 'success',
			position: 'bottom-right',
			hideAfter: 10000,
			loader: false
		})
	}
	
	function alertInfo(msg)
	{
		$.toast({
			text: msg,
			icon: 'info',
			position: 'bottom-right',
			hideAfter: 10000,
			loader: false
		})
	}
	
	function alertWarning(msg)
	{
		$.toast({
			text: msg,
			icon: 'warning',
			position: 'bottom-right',
			hideAfter: 10000,
			loader: false
		})
	}

	function signIn() {
		$.post('/pay/getWallet', 'identifier='+identifier, function(data){
			if(data.status == 'success')
			{
				$('#auth').fadeOut(500, function() {
					alertSuccess('Success');
				});
			}
			else
			{
				alertError(data.msg);
			}
		});
	}
});
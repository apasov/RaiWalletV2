var rai_wallet = require('rai-wallet');
var RaiWallet = rai_wallet.Wallet;
var Block = rai_wallet.Block;
var functions = rai_wallet.RaiFunctions;
var bigInt = require('big-integer');

var wallet;
var registered = false;
var lastRetrieved = 0;
var recentEmpty = true;
var lastWorkRetrieved = 0;
var waitingForSingleWork = false;
var logger = new Logger(true);
var txsOffset = 0;
var bottomReached = false;
var loadingTxs = false;
var lastAction = 0;
var signOutInterval = 30;
var _2fa_enabled = false;
var _2fa_confirmed = false;
var _2fa_required = 0;
var _2fa_qr_url = "";
var _2fa_key = "";
var localPow = true;
var localPowWorking = false;
var pow_workers;
var identifier = "";

var RESOLVE_FORKS_BLOCK_BATCH_SIZE = 20;
var RAI_TO_RAW = "000000000000000000000000";
var MILLION = 1000000;

$(document).ready(function(){
	
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
	
	
	/**
	 * Menu listeners
	 */
    var active = 'home';
    var moving = false;
    
    $('.signup').click(function(){
        $("#login-modal").modal('hide');
        $('#recover-id-modal').modal('hide');
        $("#signup-modal").modal();
        $('body').css('padding-right', '0px');
        return false;
    });
    
    $('.login').click(function(){
        $("#signup-modal").modal('hide');
        $("#login-modal").modal();
        $('body').css('padding-right', '0px');
        return false;
    });
    
    $('.import').click(function() {
        $('#login-modal').modal('hide');
        $('#import-seed-modal').modal();
        $('body').css('padding-right', '0px');
        return false;
    });
    
    $('#lost_id').click(function(event){
        event.preventDefault();
        $("#login-modal").modal('hide');
        $('#recover-id-modal').modal();
        $('body').css('padding-right', '0px');
        return false;
    });
    
    $('#send').click(function(){
        $("#send-modal").modal();
        $('body').css('padding-right', '0px');
        return false;
    });
    
    $('#receive').click(function(){
        $("#receive-modal").modal();
        $('body').css('padding-right', '0px');
        return false;
    });
    
    $('#change').click(function(){
        $('#change-modal').modal();
        $('body').css('padding-right', '0px');
        return false;
    })
    
    $('#ghome').click(function(event){
        event.preventDefault();
        if(active != 'home')
        {
            $('.sidebar-nav .active').removeClass('active');
            $('#ghome').parent().addClass('active');
            $('.current').fadeOut(500, function(){
                $('.current').removeClass('current');
                $('.dashboard').fadeIn();
                $('.dashboard').addClass('current');
                if(!moving)
                {
                    window.history.pushState("home", "NanoWallet - Home", "/home");
                    document.title = 'NanoWallet - Home';
                }
                active = 'home';
                moving = false;
            });
        }
    });
    
    $('#gtxs').click(function(event){
        event.preventDefault();
        if(active != 'transactions')
        {
            $('.sidebar-nav .active').removeClass('active');
            $('#gtxs').parent().addClass('active');
            $('.current').fadeOut(500, function(){
                $('.current').removeClass('current');
                $('.transactions').fadeIn();
                $('.transactions').addClass('current');
                if(!moving)
                {
                    window.history.pushState("transactions", "NanoWallet - Transactions", "/transactions");
                    document.title = 'NanoWallet - Transactions';
                }
                active = 'transactions';
                moving = false;
            });
        }
    });
    
    $('#gsecurity').click(function(event){
        event.preventDefault();
        if(active != 'security')
        {
            $('.sidebar-nav .active').removeClass('active');
            $('#gsecurity').parent().addClass('active');
            $('.current').fadeOut(500, function(){
                $('.current').removeClass('current');
                $('.security').fadeIn();
                $('.security').addClass('current');
                if(!moving)
                {
                    window.history.pushState("security", "NanoWallet - Security", "/security");
                    document.title = 'NanoWallet - Security';
                }
                active = 'security';
                moving = false;
            });
        }
    });
    
    $('#gsettings').click(function(event){
        event.preventDefault();
        if(active != 'settings')
        {
            $('.sidebar-nav .active').removeClass('active');
            $('#gsettings').parent().addClass('active');
            $('.current').fadeOut(500, function(){
                $('.current').removeClass('current');
                $('.settings').fadeIn();
                $('.settings').addClass('current');
                if(!moving)
                {
                    window.history.pushState("settings", "RaiWallet - Settings", "/settings");
                    document.title = 'RaiWallet - Settings';
                }
                active = 'settings';
                moving = false;
            });
        }
    });
    
    $('#gdebug').click(function(event){
        event.preventDefault();
        if(active != 'debug')
        {
            $('.sidebar-nav .active').removeClass('active');
            $('#gdebug').parent().addClass('active');
            $('.current').fadeOut(500, function(){
                $('.current').removeClass('current');
                $('.debug').fadeIn();
                $('.debug').addClass('current');
                if(!moving)
                {
                    window.history.pushState("debug", "NanoWallet - Debug", "/debug");
                    document.title = 'NanoWallet - Debug';
                }
                active = 'debug';
                moving = false;
            });
        }
    });

    $('#gout').click(function() {
    	window.onbeforeunload = null;
    	//window.location.href = '/out';
    });
    
    window.onpopstate = function(e)
    {
        moving = true;
        switch(e.state)
        {
            case 'home':
                $('#ghome').click();
                break;
            case 'transactions':
                $('#gtxs').click();
                break;
            case 'settings':
                $('#gsettings').click();
                break;
            case 'security':
                $('#gsecurity').click();
                break;
            case 'debug':
                $('#gdebug').click();
                break;
        }
    }

    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    });
    
    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });
	
	
	/**
	 * Infinite scroll at transactions page
	 */
	$(window).scroll(function(){
		if($(window).scrollTop() >= $(document).height() - $(window).height() - 60)
		{
			if(active == 'transactions' && !bottomReached && !loadingTxs)
			{
				loadingTxs = true;
				var blks = wallet.getLastNBlocks(functions.parseXRBAccount($('#acc-select').val()), 10, txsOffset);
				if(blks.length > 0)
				{
					txsOffset += blks.length;
					for(let i in blks)
					{
						addBlockToGui(blks[i]);
					}
				}
				else
					bottomReached = true;
				loadingTxs = false;
			}
		}
	}); 
	
	$('#refreshdebug').click(function(){
		var logs = logger.getLogs();

		$('#debug-box').html('');
		$('#ready-blocks').html('');
		$('#pending-blocks').html('');
		
		for(let i in logs)
			$('#debug-box').append(logs[i]+'<br/>');
		for(let i in logger.getWarnings())
			$('#debug-box').append(logger.getWarnings()[i]+'<br/>');
		for(let i in logger.getErrors())
			$('#debug-box').append(logger.getErrors()[i]+'<br/>');
		
		var pendingblks = wallet.getPendingBlocks();
		for(let i in pendingblks)
			$('#pending-blocks').append(pendingblks[i].getJSONBlock());
		
		var readyblks = wallet.getReadyBlocks();
		for(let i in pendingblks)
			$('#ready-blocks').append(readyblks[i].getJSONBlock());
	});

	function rawToMrai(value)
	{
		if (typeof value !== 'string') {
			throw 'rawToMrai expects a string';
		}

		const amountRaw = bigInt(value);
		const amountRai = amountRaw.divide("1000000000000000000000000");
		const amountMrai = parseFloat(amountRai / MILLION);

		return amountMrai;
	}
	
	function addAccountToGUI(accountObj)
	{
		var label_txt = "";
		var label_txt2 = "";
		if(accountObj.label !== undefined && accountObj.label != "")
		{
			label_txt = accountObj.label;
			label_txt2 = '('+label_txt+') - ';
		}
		
		var li = document.createElement('LI');
		var row = document.createElement('DIV');
		row.className += ' row';
		
		var _1 = document.createElement('DIV');
		_1.className += ' col-xs-12';
		if(label_txt == "")
			_1.className += ' hidden';
		
		var input = document.createElement('input');
		input.setAttribute('data-account', accountObj.account);
		input.type = "text";
		input.value = label_txt;
		input.className += ' label-input';
		input.placeholder = 'e.g.: RaiGames dep. address';
		input.spellcheck = false;
		var pencil = document.createElement('I');
		pencil.setAttribute('aria-hidden', 'true');
		pencil.className += ' fa fa-pencil cstm-pencil';
		_1.appendChild(input);
		_1.appendChild(pencil);
		row.appendChild(_1);
		
		var _2 = document.createElement('DIV');
		_2.className += 'col-xs-12';
		
		var span = document.createElement('SPAN');
		var txt = document.createTextNode(accountObj.account);
		var link = document.createElement('a');
		link.setAttribute('href','https://raiblocks.net/account/index.php?acc='+accountObj.account);
		link.setAttribute('target','_blank');
		link.appendChild(txt);
		span.appendChild(link);
		_2.appendChild(span);
		row.appendChild(_2);
		li.appendChild(row);
		document.querySelector('.accounts ul').appendChild(li);
		
		if(label_txt == "")
		{
			li.addEventListener('click', function(){
				showLabelInput(_1);
			});
		}
		input.addEventListener('change', function(){
			updateAccountLabel(accountObj.account, input);
		});
		
		
		$('#send-select').append('<option class="acc_select_'+accountObj.account+'">'+label_txt2+accountObj.account+' ('+(accountObj.balance / 1000000).toFixed(6)+' XRB)</option>');
		$('#receive-select').append('<option class="acc_select_'+accountObj.account+'">'+label_txt2+accountObj.account+' ('+(accountObj.balance / 1000000).toFixed(6)+' XRB)</option>');
		$('#change-select').append('<option>'+label_txt2+accountObj.account+'</option>');
		$('#acc-select').append('<option>'+label_txt2+accountObj.account+'</option>');
	}
	
	function showLabelInput(_1)
	{
		if($(_1).hasClass('hidden'))
		{
			$(_1).fadeOut(0).removeClass('hidden');
			$(_1).fadeIn();
		}
	}
	
	function updateAccountLabel(acc, input)
	{
		var val = input.value;
		if(val == "" && !$(input).hasClass('hidden'))
		{
			$(input).parent().fadeOut(1000, function(){input.addClass('hidden')});
		}
		if (wallet.setLabel(acc, val))
		{
			sync();
			alertInfo('Label updated');
		}
	}
	
	function addRecentRecToGui(txObj)
	{
		if(recentEmpty)
			$('.recent').html('');
		recentEmpty = false;
		$('.recent').append('<ul id="'+txObj.hash+'"><li><div class="row">'+
								'<div class="col-xs-3">'+
									'<b class="green">Received</b>'+
								'</div>'+
								'<div class="col-xs-4"><a href="https://raiblocks.net/block/index.php?h='+txObj.hash+'" target="_blank">'+txObj.hash.substring(0,20)+'....</a></div>'+
								'<div class="col-xs-5 text-right">'+
									'<span class="green">'+(txObj.amount.over("1000000000000000000000000").toJSNumber() / 1000000).toFixed(8)+'</span> XRB'+
								'</div>'+
							'</div></li></ul>');
	}
	
	function removeRecentFromGui(hash)
	{
		var elem = $('.recent').find('#'+hash);
		
		refreshBalances();
		
		elem.fadeOut(1500, function(){elem.remove()});
	}
	
	function addRecentSendToGui(txObj)
	{
		if(recentEmpty)
			$('.recent').html('');
		recentEmpty = false;
		$('.recent').append('<ul id="'+txObj.hash+'"><li><div class="row">'+
								'<div class="col-xs-3">'+
									'<b class="red">Sent</b>'+
								'</div>'+
								'<div class="col-xs-3">'+txObj.date+'</div>'+
								'<div class="col-xs-6 text-right">'+
									'<span class="red">'+(txObj.amount.over("1000000000000000000000000").toJSNumber() / 1000000).toFixed(8)+'</span> XRB'+
								'</div>'+
							'</div></li></ul>');
	}
	
	function addRecentChangeToGui(txObj)
	{
		if(recentEmpty)
			$('.recent').html('');
		recentEmpty = false;
		$('.recent').append('<ul id="'+txObj.hash+'"><li><div class="row">'+
								'<div class="col-xs-3">'+
									'<b class="change">Change</b>'+
								'</div>'+
								'<div class="col-xs-9">'+txObj.representative.substring(0,25)+' ....</div>'+
							'</div></li></ul>');
	}
	
	function emptyRecent()
	{
		recentEmpty = true;
		$('.recent').append('<div class="row"><div class="col-xs-12" style="color:#888">There is nothing to show here.</div></div>');
	}
	
	function refreshBalances()
	{
		var balance = wallet.getWalletBalance();
		var pending = wallet.getWalletPendingBalance();
		
		$('#pending').html((pending.over("1000000000000000000000000").toJSNumber() / 1000000).toFixed(6));
		$('#balance').html((balance.over("1000000000000000000000000").toJSNumber() / 1000000).toFixed(6));
		
		var accs = wallet.getAccounts();
		for(let i in accs)
		{
			var acc = accs[i].account;
			var bal = accs[i].balance;
			var label = accs[i].label;
			if(label == "")
				$('select').find('.acc_select_'+acc).html(acc+' ('+(bal.over("1000000000000000000000000").toJSNumber() / 1000000).toFixed(6)+' XRB)');
			else
				$('select').find('.acc_select_'+acc).html('('+label+') - '+acc+' ('+(bal.over("1000000000000000000000000").toJSNumber() / 1000000).toFixed(6)+' XRB)');
		}
	}
	
	function sync()
	{
		lastAction = Date.now() / 1000;
		$.post('/wallet/sync', 'identifier='+identifier+'&data='+wallet.pack(), function(data){
			if(data.status == 'redirect')
			{
				window.location.href=data.location;
			}
		});
	}
	
	function clientPoW()
	{
		localPowWorking = true;
		if(!localPow)
			return setTimeout(clientPoW, 1000);
		
		var pool = wallet.getWorkPool();
		var hash = false;
		if(pool.length > 0)
		{
			for(let i in pool)
			{
				if(pool[i].needed ||!pool[i].requested)
				{
					hash = pool[i].hash;
					break;
				}
			}
			
			if(hash === false)
				return setTimeout(clientPoW, 1000);
			
			pow_workers = pow_initiate(NaN, 'js/');
			pow_callback(pow_workers, hash, function() {
				logger.log('Working locally on ' + hash);
			}, function(work) {
				logger.log('PoW found for ' + hash + ": " + work);
				wallet.updateWorkPool(hash, work);
				setTimeout(clientPoW, 1000);
			});
		}
		else
		{
			setTimeout(clientPoW, 1000);
		}
	}
	
	function recheckWork()
	{
		var pool = wallet.getWorkPool();
		var batch = [];
		
		if(localPow)
		{
			if(!localPowWorking)
				setTimeout(clientPoW, 1);
			return setTimeout(recheckWork, 5000);
		}
		
		for(let i in pool)
		{
			if(!pool[i].requested || pool[i].needed)
			{
				batch.push(pool[i].hash);
			}
		}
		
		if(batch.length > 0)
		{
			if(batch.length > 1)
			{
				$.post('/wallet/batchWork', 'batch='+JSON.stringify(batch), function(data){
					if(data.status == 'success')
					{
						console.log('Work requested for blocks ', batch);
						for(let i in data.workRes)
						{
							var work = data.workRes[i].work;
							var hash = data.workRes[i].hash;
							if(data.work != false)
								wallet.updateWorkPool(hash, work);
							else
								wallet.setWorkNeeded(hash);
						}
					}
					else if(data.status == 'redirect')
					{
						window.location.href=data.location;
					}
					setTimeout(recheckWork, 5000);
				});
			}
			else
			{
				remoteWork(batch[0]);
				setTimeout(recheckWork, 5000);
			}
		}
		else
			setTimeout(recheckWork, 5000);
	}
	
	function broadcastBlock(blk)
	{
		var json = blk.getJSONBlock();
		var obj = JSON.parse(json);
		var hash = blk.getHash(true);
		var guiHash;
		if(blk.getType() == 'open' || blk.getType() == 'receive')
			guiHash = blk.getSource();
		else
			guiHash = blk.getHash(true);
		
		var am = 'false';
		if(blk.getType() == 'send')
		{
			// send the balance before the block to check if it matches
			// just in case
			am = blk.getBalance().plus(blk.getAmount()).toString();
		}
		
		$.post('/wallet/broadcast', 'hash='+hash+"&data="+json+'&amount='+am, function(data){
			if(data.status == 'success')
			{
				wallet.removeReadyBlock(hash);
				removeRecentFromGui(guiHash);
				console.log('Block broadcasted to network: '+hash);
				alertInfo(blk.getType()+" block broadcasted to network.");
				updateAccountGUI(blk.getAccount());
			}
			else if(data.status == 'redirect')
			{
				window.location.href=data.location;
			}
			else
			{
				console.warn('Error broadcasting block: '+hash+". Error: "+data.msg);
			}
		});
	}
	
	function rebroadcastBlock(blockHash)
	{
		$.post('/wallet/rebroadcast', 'hash='+blockHash, function(data){
			if(data.status == 'success')
			{
				alertInfo('Block rebroadcated');
			}
			else
			{
				alertError(data.msg);
			}
		});
	}
	
	function updateAccountGUI(acc)
	{
		refreshChain();
		
		// update account balance on send and receive modals
		var balance = wallet.getAccountBalance(acc).over("1000000000000000000000000").toJSNumber();
		$('#sendbalance_'+acc).html(balance);
		$('#receivebalance_'+acc).html(balance);
	}
	
	function refreshChain()
	{
		txsOffset = 0;
		bottomReached = false;
		loadingTxs = false;
		
		var selected = functions.parseXRBAccount($('#acc-select').val());
		var last = wallet.getLastNBlocks(selected, 20);
		clearBlocksFromGui();
		
		for(let i in last)
			addBlockToGui(last[i]);
		txsOffset = last.length;
	}
	
	function updateReceiveQr(account = null)
	{
		var acc = account ? account : functions.parseXRBAccount($('#receive-select').val());
		var am = $('#receive-amount').val();
		if(acc)
			$('#qr .img').html('<img style="height: 200px; margin-left: auto; margin-right: auto;" src="https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=raiblocks:'+acc+'?amount='+am+'">')
		$('.qr-bot').html('<code>'+acc+'</code>');
		$('#qr').addClass('well');
	}
	
	function getPendingBlocks()
	{
		var accs = wallet.getAccounts();
		var accounts = [];
		for(let i in accs)
			accounts.push(accs[i].account);
		$.post('/wallet/pending', 'accounts='+JSON.stringify(accounts), function(data){
			if(data.status == 'success')
			{
				for(var account in data.res)
				{
					for(let i in data.res[account].blocks)
					{
						var blk = data.res[account].blocks[i];
						if(wallet.addPendingReceiveBlock(blk.hash, account, blk.from, blk.amount))
						{
							var txObj = {account: account, amount: bigInt(blk.amount), date: blk.from, hash: blk.hash}
							addRecentRecToGui(txObj);
						}
					}
				}
			}
			else if(data.status == 'redirect')
			{
				window.location.href=data.location;
			}
			setTimeout(getPendingBlocks, 5000);
		})
	}
	
	function remoteWork(hash)
	{
		$.post('/wallet/remoteWork', 'hash='+hash, function(data)
		{
			if(data.status == 'success')
			{
				console.log('Work requested for block ' + hash);
				if(data.work != false)
					wallet.updateWorkPool(hash, data.work);
				else
					wallet.setWorkNeeded(hash);
			}
			else if(data.status == 'redirect')
			{
				window.location.href=data.location;
			}
		});
	}
	
	function getSingleWork(hash, acc)
	{
		if(waitingForSingleWork)
			return;
		waitingForSingleWork = true;
		
		var request = function()
		{
			if(waitingForSingleWork)
			{
				$.post('/wallets/getSingleWork', 'hash='+hash, function(data){
					if(data.status == 'success')
					{
						if(data.found == true)
						{
							if(data.worked)
							{
								wallet.updateWorkPool(hash, data.work);
								waitingForSingleWork = false;
							}
							else
								setTimeout(request, 3000);
						}
						else
						{
							// not found? submit it
							remoteWork(hash);
						}
					}
					else if(data.status == 'redirect')
					{
						window.location.href=data.location;
					}
					else
						setTimeout(request, 3000);
				});
			}
		}
		request();
	}
	
	function cancelWait()
	{
		waitingForSingleWork = false;
	}
  
	function checkReadyBlocks()
	{
		var blk = wallet.getNextReadyBlock();
		if(blk !== false)
			broadcastBlock(blk);
		setTimeout(checkReadyBlocks, 5000);
	}
	
	/**
	 * Asks the server for the last blocks and balance for each account
	 */
	function checkChains(callback)
	{
		var accs = wallet.getAccounts();
		console.log(accs);
		var r = [];
		for (let i in accs)
			if(accs[i].lastHash === false)
				r.push(accs[i].account);
				
		$.post('/wallet/chains', 'accs='+JSON.stringify(r), function(data) {
			if(data.status == 'success')
			{
				for(let acc in data.accounts)
				{
					let blocks = data.accounts[acc].blocks;
					blocks.reverse();
					for(let i in blocks)
					{
						var blk = new Block();
						blk.buildFromJSON(blocks[i].contents);
						blk.setAccount(acc);
						blk.setAmount(blocks[i].amount)
						blk.setImmutable(true);
						wallet.importBlock(blk, acc, false);
					}
					wallet.useAccount(acc);
					wallet.setAccountBalancePublic(data.accounts[acc].balance, acc);
				}
			}	
			else
			{
				console.error(data.msg);
				alertError(data.msg);
			}
			callback();
		});
	}
	
	function debugAllWallet()
	{
		wallet.debug();
		setTimeout(debugAllWallet, 3000);
	}
	
	function load2faSettings()
	{
		if(_2fa_confirmed)
		{
			$('#2fa_confirm').fadeIn();
			$('#button_2fa').html('Disable');
			$('#qr_2fa').html('');
			$('#2fa_key').html('');
			$('#2fa_confirm_input').val('');
			$('#button_2fa').addClass('btn-danger');
			$('#button_2fa').removeClass('btn-primary');
		}
		else if(_2fa_enabled)
		{
			$('#2fa_confirm').fadeIn();
			$('#button_2fa').html('Confirm');
			$('#qr_2fa').html('<img src="'+_2fa_qr_url+'" class="img-responsive" />');
			$('#2fa_key').html("Key: "+_2fa_key);
			$('#2fa_confirm_input').val('');
			$('#button_2fa').addClass('btn-primary');
			$('#button_2fa').removeClass('btn-danger');
		}
		else
		{
			// disabled
			$('#2fa_confirm').fadeOut();
			$('#button_2fa').html('Enable');
			$('#qr_2fa').html('');
			$('#2fa_key').html('');
			$('#2fa_confirm_input').val('');
			$('#button_2fa').addClass('btn-primary');
			$('#button_2fa').removeClass('btn-danger');
		}
	}
	
	function goToWallet()
	{
		// load wallet template
		$('.landing').html('<div class="transition-overlay"><span>NANOWALLET</span><br/><i class="fa fa-circle-o-notch fa-spin fa-fw"></i></div>');
		$(".modal").modal('hide');

		// load elements and display wallet
		var accounts = wallet.getAccounts();
		var total_balance = 0;
		for(let i in accounts)
		{
			addAccountToGUI(accounts[i]);
		}
		$('#minimum_receive').val(wallet.getMinimumReceive().over("1000000000000000000000000"));

		checkChains(function(){
			load2faSettings();
			refreshBalances();
			getPendingBlocks();
			recheckWork();
			checkReadyBlocks(); 
			
			var selected = wallet.getAccounts()[0].account;
			var last = wallet.getLastNBlocks(selected, 20);
			clearBlocksFromGui();

			for(let i in last)
				addBlockToGui(last[i]);
			txsOffset = last.length;

			lastAction = Date.now() / 1000;
			autoSignOut();
			$('button, li, input').click(function(){
				lastAction = Date.now() / 1000;
			});
			
			const params = (new URL(location)).searchParams;
			let encoded_address = params.get('encoded_address');
			let amountMrai = params.get('amount') ? rawToMrai(params.get('amount')) : undefined;

			window.history.pushState("home", "NanoWallet - Home", "/home");
			document.title = 'NanoWallet - Home';

			window.onbeforeunload = function(e) {
				var dialogText = 'Refreshing the page will require you to decrypt your wallet again.';
				e.returnValue = dialogText;
				return dialogText;
			};

			setTimeout(function(){
				$('.landing').fadeOut(500, function(){
					$('.landing').remove();
					$('.wallet-wrapper').fadeIn();
				});

				if (encoded_address || amountMrai) {
					$("#send-modal").on('shown.bs.modal', function (e) {
						if (encoded_address && functions.parseXRBAccount(encoded_address)) {
							$("#to").val(encoded_address);
						}
						if (amountMrai && isFinite(amountMrai)) {
							$("#samount").val(amountMrai);
						}
						// Remove the event
						$("#send-modal").off('shown.bs.modal');
						// Set to undefined, incase this method is called again
						amountMrai = undefined;
						encoded_address = undefined;
					});
					$("#send-modal").modal();
				}
			}, 1000);
		});
	}
	
	function imLoggedIn(callback = null)
	{
		var syncwallet = 0;
		if(!wallet.getLoginKey())
		{
			// login key hasnt been generated yet
			wallet.setLoginKey();
			syncwallet = wallet.pack();
		}
		$.post('/wallet/imLoggedIn', 'loginKey='+wallet.getLoginKey()+'&identifier='+identifier+'&wallet='+syncwallet, function(data2) {
			if(data2.status == 'success')
			{
				if(data2._2fa_enabled)
				{
					_2fa_enabled = true;
					_2fa_confirmed = true;
				}
				if(callback)
					callback();
				else
					$('input').prop('disabled', 0);
			}
			else
			{
				alertError(data.msg);
				console.error(data.msg);
			}
		});
	}
	
	$('.form-register').submit(function(e){
		e.preventDefault();
		// check pass
		if($('#psw').val() == $('#psw2').val())
		{
			if($('#psw').val().length < 8)
			{
				alertError("You are going to store money, choose a stronger password :P");
				return false;
			}
			
			// create wallet and send to server
			wallet = new RaiWallet($('#psw').val());
			wallet.setLogger(logger);
			wallet.lightWallet(true);
			var seed = wallet.createWallet();
			var pack = wallet.pack();
			var email = $('#email').val();
			var loginKey = wallet.getLoginKey();
			$('input').prop('disabled', true);
			$.post('/wallet/register', 'email='+email+'&wallet='+pack+'&loginKey='+loginKey, function(data){
				if(data.status == 'success')
				{
					alertInfo('Wallet successfully registered.');
					$('#wallet_id_reg').html(data.identifier);
					$('#wallet_seed_reg').html(seed);
					$('.registering').fadeOut(500, function(){
						$('.registered').fadeIn(500);
					});
					identifier = data.identifier;
					registered = true;
				}
				else
				{
					alertError(data.msg);
				}
				$('input').prop('disabled', false);
			});
		}
		else
			alertError('Passwords do not match.');
		
		return false;
		
	});
	
	$('.form-login').submit(function(e){
		e.preventDefault();
		var wid = $('#wid').val();
		var code = $('#2fa_login_code').val();
		
		$('input').prop('disabled', true);
		$.post('/wallet/login', 'action=login&identifier='+wid+'&_2fa='+code+"&_2farequired="+_2fa_required, function(data){
			
			if(data.status == 'success')
			{
				if(data._2fa)
				{
					$('#2fa_login_code').val('');
					$('#_2fa_input').fadeIn();
					alertInfo("Enter google authenticator code.");
					_2fa_required = 1;
				}
				else
				{
					// decrypt wallet and check checksum
					wallet = new RaiWallet($('#password').val());
					wallet.setLogger(logger);
					$('#password').val('');
					wallet.lightWallet(true);
					
					try{
						wallet.load(data.wallet);
					}catch(e){
						alertError('Error decrypting wallet. Check that the password is correct.');
						$('input').prop('disabled', 0);
						console.log(e);
						return;
					}
					
					identifier = data.identifier;
					
					if(data.alias)
					{
						$('#alias').val(data.alias);
					}
					
					
					// default to server side pow always 
					localPow = false;
					$('#pow_checkbox').prop('checked', false);
					
					signOutInterval = data.sign_out;
					$('#aso_time').val(signOutInterval);
					
					// notify server about successful decryption to allow accessing authenticated methods
					var syncwallet = 0;
					if(!wallet.getLoginKey())
					{
						// login key hasnt been generated yet
						wallet.setLoginKey();
						syncwallet = wallet.pack();
					}
					imLoggedIn(goToWallet);
					/*
					$.post('/wallet/imLoggedIn', 'loginKey='+wallet.getLoginKey()+'&identifier='+identifier+'&wallet='+syncwallet, function(data2) {
						if(data2.status == 'success')
						{
							if(data2._2fa_enabled)
							{
								_2fa_enabled = true;
								_2fa_confirmed = true;
							}
							goToWallet();
						}
						else
						{
							alertError(data.msg);
							console.error(data.msg);
						}
					});
					*/
				}
			}
			else
			{
				alertError(data.msg);
			}
			$('input').prop('disabled', 0);            
		});
		return false;
	});
	
	$('.2fa_set_form').submit(function(e){
		e.preventDefault();
		$('#button_2fa').click();
		return false;
	});
	
	$('.gotowallet').click(goToWallet);
	
	$('.form-send').submit(function(event){
		event.preventDefault();
		// reset field errors
		$('#to').css('border-color', '#ccc');
		$('#samount').css('border-color', '#ccc');
		var error = false;
		
		// from
		var from = functions.parseXRBAccount($('#send-select').val());
		if(from === false)
			return alertError('Invalid origin address');
		
		// check address
		var to = $('#to').val();
		try{
			functions.keyFromAccount(to);
		}catch(e){
			alertError('Invalid XRB address.');
			$('#to').css('border-color', '#880000');
			error = true;
		}
		
		var balance = wallet.getAccountBalance(from);
		
		var amount = parseFloat($('#samount').val());
		var amountRai = parseInt(amount * 1000000);
		var amountRaw = bigInt(amountRai).multiply("1000000000000000000000000");
		if(amount <= 0)
		{
			alertError('Invalid amount.');
			$('#samount').css('border-color', '#880000');
			error = true;
		}
		
		if(amountRaw.greater(balance))
		{
			alertError('Amount is greater than balance in the selected account.');
			console.log(amountRaw);
			console.log(balance);
			$('#samount').css('border-color', '#880000');
			error = true;
		}
		
		if(!error)
		{
			try{
				var blk = wallet.addPendingSendBlock(from, to, amountRaw);
				var hash = blk.getHash(true);
				
				refreshBalances();
				$(".modal").modal('hide');
				alertInfo("Transaction built successfully. Waiting for work ...");
				addRecentSendToGui({date: "Just now", amount: amountRaw, hash: hash});
				wallet.workPoolAdd(blk.getPrevious(), from, true);
			}catch(e){
				alertError('Ooops, something happened: ' + e.message);
			}
				
		}
		return false;
	});
	
	$('#generate_acc').click(function(){
		var newAccount = wallet.newKeyFromSeed();
		addAccountToGUI({account: newAccount, balance: 0});
		checkChains(function(){
			refreshBalances();
			sync();
			alertSuccess('New account added to wallet.');
			wallet.useAccount(newAccount);
			updateReceiveQr(newAccount);
		});
	});
	
	$('#change_repr').click(function(){
		var selected = functions.parseXRBAccount($('#change-select').val());
		var repr = $('#acc-repr').val();
		
		try{
			functions.keyFromAccount(repr);
		}catch(e){
			alertError("Invalid representative account.");
			return;
		}
		
		try{
			var blk = wallet.addPendingChangeBlock(selected, repr);
			sync();
			var txObj = {representative: repr, hash: blk.getHash(true)};
			addRecentChangeToGui(txObj);
			alertInfo("Representative changed. Waiting for work to broadcast the block.");
		}catch(e){
			console.log(e);
			alertError('Something happened: ' + e);
		}
	});
	
	$('#receive-select').change(function(){
		updateReceiveQr();
	});
	
	$('#receive-amount').keyup(function(){
		updateReceiveQr();
	});
	
	$('#change-select').change(function(){
		var selected = functions.parseXRBAccount($('#change-select').val());
		var repr = wallet.getRepresentative(selected);
		$('#acc-repr').val(repr);
	});
	
	
	$('#acc-select').change(function(){
		refreshChain();
	});
	
	$('#refresh').click(function(){
		wallet.recalculateWalletBalances();
	});
	
	
	function addBlockToGui(block, prepend = false)
	{
		if(prepend)
			var func = 'prepend';
		else
			var func = 'append';
		
		if(block.getType() != 'change')
		{
			if(block.getType() == 'send')
			{
				var color = 'red';
				var fromto = 'To: ';
				var symbol = '-';
				var account = block.getDestination();
			}
			else
			{
				var color = 'green';
				var fromto = 'From: ';
				var symbol = '+';
				var account = block.getOrigin();
			}
			var type = block.getType();
			
			$('.txs ul')[func](
				'<li id="tx_' + block.getHash(true) + '">'+
					'<div class="row">'+
						'<div class="col-sm-2">'+
							'<span class="blk-type '+type+'">'+block.getType()+'</span><br/>'+
							'<span class="'+color+' blk-amount">'+symbol+''+(block.getAmount().over("1000000000000000000000000").toJSNumber() / 1000000).toFixed(6)+'</span>'+
						'</div>'+
						'<div class="col-sm-6">'+
							'<a href="https://raiblocks.net/block/index.php?h='+block.getHash(true)+'" target="_blank"><span class="blk-hash"> '+block.getHash(true)+'</span></a><br/>'+
							'<b>'+fromto+'</b><span class="blk-account">'+account+'</span>'+
						'</div>'+
						'<div class="col-sm-4 text-center">'+
							'<button type="button" data-toggle="tooltip" data-placement="left" title="View Block" class="btn btn-default gborder" style="margin-right:5px" onclick="$(\'.txs ul\').find(\'#json_'+block.getHash(true)+'\').fadeToggle();"><i class="fa fa-angle-down" aria-hidden="true"></i></button>'+
							'<button type="button" data-toggle="tooltip" data-placement="right" title="Rebroadcast" class="btn btn-default gborder rebroadcast" id="rebroadcast_'+block.getHash(true)+'" ><i class="fa fa-paper-plane-o" aria-hidden="true"></i></button>'+
						'</div>'+
						'<div class="col-sm-12" style="display:none; margin-top:15px" id="json_'+block.getHash(true)+'">'+
							'<pre><code>'+block.getJSONBlock(true)+'</code></pre>'+
						'</div>'+
					'</div>'+
				'</li>'
			);
		}
		else
		{
			var type = "change";
			$('.txs ul')[func](
				'<li id="tx_' + block.getHash(true) + '">'+
					'<div class="row">'+
						'<div class="col-sm-2">'+
							'<span class="blk-type '+type+'">'+block.getType()+'</span>'+
						'</div>'+
						'<div class="col-sm-6">'+
							'<a href="https://raiblocks.net/block/index.php?h='+block.getHash(true)+'" target="_blank"><span class="blk-hash"> '+block.getHash(true)+'</span></a><br/>'+
							'<span class="blk-account">'+block.getRepresentative()+'</span>'+
						'</div>'+
						'<div class="col-sm-4 text-center">'+
							'<button type="button" data-toggle="tooltip" data-placement="left" title="View Block" class="btn btn-default gborder" style="margin-right:5px" onclick="$(\'.txs ul\').find(\'#json_'+block.getHash(true)+'\').fadeToggle();"><i class="fa fa-angle-down" aria-hidden="true"></i></button>'+
							'<button type="button" data-toggle="tooltip" data-placement="right" title="Rebroadcast" class="btn btn-default gborder rebroadcast" id="rebroadcast_'+block.getHash(true)+'" ><i class="fa fa-paper-plane-o" aria-hidden="true"></i></button>'+
						'</div>'+	
						'<div class="col-sm-12" style="display:none; margin-top:15px" id="json_'+block.getHash(true)+'">'+
							'<pre><code>'+block.getJSONBlock(true)+'</code></pre>'+
						'</div>'+
					'</div>'+
				'</li>'
			);
		}
		$('[data-toggle="tooltip"]').tooltip(); 
	}
	
	
	$('.txs ul').on('click', '.rebroadcast', function (){
		var hash = $(this).attr('id').replace('rebroadcast_', '');
		rebroadcastBlock(hash);
	});
	
	$('.form-minimum').submit(function(event){
		event.preventDefault();
		var minimum = parseInt($('#minimum_receive').val());
		if(minimum < 0)
		{
			alertError('Invalid minimum amount');
			return;
		}
		
		if(wallet.setMinimumReceive(bigInt(minimum).multiply("1000000000000000000000000")))
		{
			sync();
			alertInfo('Settings updated');
		}
		else
		{
			$('#minimum_receive').val(wallet.getMinimumReceive().over("1000000000000000000000000"));
			alertError('Error updating setting. Make sure you entered a valid number in rai units.');
		}
	});
	
	$('.form-alias').submit(function(event){
		event.preventDefault();
		var serialize = $(this).serialize();
		
		$.post('/wallet/alias', serialize, function(data){
			if(data.status == 'success')
			{
				alertSuccess(data.msg);
			}
			else
				alertError(data.msg);
		});
		return false;
	});
	
	$('.form-autologout').submit(function(event){
		event.preventDefault();
		var serialize = $(this).serialize();
		$.post('/wallet/setSignOut', serialize, function(data){
			if(data.status == 'success')
			{
				alertSuccess(data.msg);
				signOutInterval = $('#aso_time').val();
			}
			else
				alertError(data.msg);
		});
		return false;
	});
	
	$('.form-recovery').submit(function(event) {
		event.preventDefault();
		var serialize = $(this).serialize();
		$.post('/wallet/recovery', serialize, function(data) {
			if(data.status == 'success')
			{
				alertSuccess(data.msg);
			}
			else
				alertError(data.msg);
		});
		return false;
	});
	
	$('.form-import').submit(function(event) {
		event.preventDefault();
		let s = $('#i_seed').val();
		let p1 = $('#import_psw1').val();
		let p2 = $('#import_psw2').val();
		
		if(p1 == p2) {
			if(/^[0-9A-Fa-f]{64}$/.test(s)) {
				// create wallet and send to server
				wallet = new RaiWallet(p1);
				wallet.setLogger(logger);
				wallet.lightWallet(true);
				var seed = wallet.createWallet(s);
				var pack = wallet.pack();
				var email = $('#email-import').val();
				var loginKey = wallet.getLoginKey();
				
				$('input').prop('disabled', true);
				$.post('/wallet/register', 'action=register&email='+email+'&wallet='+pack+'&loginKey='+loginKey, function(data){
					
					if(data.status == 'success')
					{
						alertInfo('Wallet successfully registered.');
						$('#wallet_id_import').html(data.identifier);
						$('#wallet_seed_import').html(seed);
						$('.importing').fadeOut(500, function(){
							$('.imported').fadeIn(500);
						});
						registered = true;
						identifier = data.identifier;
					}
					else
					{
						alertError(data.msg);
					}
					$('input').prop('disabled', false);
				});
				
			} else {
				alertError('Invalid walled seed. It should be a hex encoded 32 byte string.');
			}
		} else {
			alertError('Passwords do not match');
		}
		
		return false;
	});
	
	$('#seed_button').click(function(){
		try{
			$('#seed_backup').val(wallet.getSeed($('#seed_pass').val()));
			$('#seed_pass').val('');
			setTimeout(function(){
				$('#seed_backup').val($('#seed_backup').attr('value'));
			}, 30000);
			alertInfo('Seed will be visible for 30 seconds.');
		}catch(e){
			alertError('Incorrect password');
		}
	});
	
	$('#change-pass').click(function(){
		var old = $('#change-pass-current').val();
		var new1 = $('#change-pass-new1').val();
		var new2 = $('#change-pass-new2').val();
		
		if(new1 != new2)
		{
			alertError('Passwords do not match.');
			return;
		}
		
		if(new1.length < 8)
		{
			alertWarning("Use a safer password OMG");
			return;
		}
		
		try{
			wallet.changePass(old, new1);
			sync();
			alertSuccess('Password successfully changed.');
			old = $('#change-pass-current').val('');
			new1 = $('#change-pass-new1').val('');
			new2 = $('#change-pass-new2').val('');
		}catch(e){
			alertError(e);
		}
		
	});
	
	$('#button_2fa').click(function(){
		if(!_2fa_enabled)
		{
			// enable
			$('#button_2fa').prop('disabled', true);
			$.post('/wallet/enable2fa', 'action=enable2fa', function(data) {
				if(data.status == 'success')
				{
					_2fa_enabled = true;
					_2fa_confirmed = false;
					_2fa_qr_url = data.qr_url;
					_2fa_key = data._2fa_key;
					load2faSettings();
					alertInfo('Add this key to your google authenticator app and enter the code to confirm it.');
				}
				else
					alertError(data.msg);
				$('#button_2fa').prop('disabled', false);
			});
		}
		else if(!_2fa_confirmed)
		{
			// confirm
			$('#button_2fa').prop('disabled', true);
			var code = $('#2fa_confirm_input').val();
			$.post('/wallet/confirm2fa', 'code='+code, function(data){
				if(data.status == 'success')
				{
					_2fa_enabled = true;
					_2fa_confirmed = true;
					load2faSettings();
					alertSuccess('2fa successfully enabled.');
				}
				else
				{
					alertError(data.msg);
				}
				$('#button_2fa').prop('disabled', false);
			});
		}
		else
		{
			// disable
			var code = $('#2fa_confirm_input').val();
			$('#button_2fa').prop('disabled', true);
			$.post('/wallet/disable2fa', 'code='+code, function(data) {
				if(data.status == 'success')
				{
					alertSuccess(data.msg);
					_2fa_enabled = false;
					_2fa_confirmed = false;
					load2faSettings();
				}
				else
					alertError(data.msg);
				$('#button_2fa').prop('disabled', false);
			});
		}
	});
	
	$('#pow_checkbox').change(function(){
		if($(this).is(":checked"))
		{
			localPow = true;
			localPowWorking = true;
			clientPoW();
			alertInfo('Preferences updated. PoW will be generated at client side now.');
		}
		else
		{
			localPow = false;
			pow_terminate(pow_workers);
			localPowWorking = false;
			alertInfo('Preferences updated. PoW will be generated at server side now.');
		}
	});
	
	$('#change-iterations').click(function(){
		var newIterations = parseInt($('#iteration_number').val());
		var oldIterations = wallet.getIterations();
		if(newIterations < 500)
		{
			alertWarning("A greater iteration number is recommended.");
		}
		
		try{
			wallet.setIterations(newIterations);
			$('#iteration_number').val('');
			alertInfo("PBKDF2 iterations updated.");
		}catch(e){
			alertError(e);
		}
	});
	
	$('#download_wallet').click(function(){
		var data = wallet.pack();
		var link = document.createElement('a');
		link.download = 'NanoWalletBackUp.dat';
		var blob = new Blob([data], {type: 'text/plain'});
		link.href = window.URL.createObjectURL(blob);
		link.click();
	});
	
	function clearBlocksFromGui()
	{
		$('.txs ul').html('');
	}
	
	function autoSignOut()
	{
		if(Date.now() / 1000 - lastAction > 60 * signOutInterval)
		{
			window.onbeforeunload = null;
			window.location.href = '/out';
		}
		setTimeout(autoSignOut, 30000);
	}

	// raiwallet pay functions //
	function addAccountToPaySelect(account)
	{
		if(account.label)
			$('.pay-account-select').append('<option value="'+account.account+'"> '+(account.balance.over("1000000000000000000000000").toJSNumber() / 1000000).toFixed(6)+' XRB - '+account.label+' ('+account.account+')</option>');
		else
			$('.pay-account-select').append('<option value="'+account.account+'"> '+(account.balance.over("1000000000000000000000000").toJSNumber() / 1000000).toFixed(6)+' XRB - '+account.account+'</option>');
	}

	function signInAndPay()
	{
		var wid = $('#identifier').val();
		var code = $('#2fa_login_code').val();
		
		$('input').prop('disabled', true);
		$('#pay-login-button').html('<i class="fa fa-circle-o-notch fa-spin fa-fw"></i>');
		$.post('/wallet/login', 'action=login&identifier='+wid+'&_2fa='+code+"&_2farequired="+_2fa_required, function(data){
			
			if(data.status == 'success')
			{
				if(data._2fa)
				{
					$('#2fa_login_code').val('');
					$('#_2fa_input').fadeIn();
					alertInfo("Enter google authenticator code.");
					_2fa_required = 1;
					$('input').prop('disabled', 0);
				}
				else
				{
					// decrypt wallet and check checksum
					wallet = new RaiWallet($('#password').val());
					$('#password').val('');
					wallet.lightWallet(true);
					
					try{
						wallet.load(data.wallet);
					}catch(e){
						alertError('Error decrypting wallet. Check that the password is correct.');
						$('input').prop('disabled', 0);
						return;
					}
					
					identifier = data.identifier;
					
					// notify server about successful decryption to allow accessing authenticated methods
					imLoggedIn(function() {	
						checkChains(function(err) {
							if(err) {
								alertError('Error trying to fetch wallet balances. Try again.');
								return;
							}

							var accs = wallet.getAccounts();
							for(let i in accs)
							{
								let acc = accs[i];
								acc.balance = wallet.getAccountBalance(acc.account);
								if(acc.balance == 0)
									acc.balance = bigInt(0);
								addAccountToPaySelect(acc);
							}

							$('#login-form').fadeOut(250, function() {
								$('#pay-form').fadeIn(250);
							});
							$('input').prop('disabled', 0);
						});
					});
				}
			}
			else
			{
				alertError(data.msg);
				$('input').prop('disabled', 0);
			}
		});
		return false;
	}
	
	function confirmPayment()
	{
		$('.pay-account-select').css('border-color', '#cccccc');
		var from = functions.parseXRBAccount($('.pay-account-select').val());
		if(!from)
		{
			alertError('Invalid origin address.');
			return;
		}
		
		var to = functions.parseXRBAccount($('#pay_address').val());
		if(!to)
		{
			alertError('Invalid destination address.');
			return;
		}
		
		var balance = wallet.getAccountBalance(from);
		
		var amount = parseFloat($('#pay_amount').val());
		var amountRai = parseInt(amount * 1000000);
		var amountRaw = bigInt(amountRai).multiply("1000000000000000000000000");
		if(amount <= 0)
		{
			alertError('Invalid amount.');
			return;
		}
		
		if(amountRaw.greater(balance))
		{
			alertError('Amount is greater than balance in the selected account.');
			console.log(amountRaw);
			console.log(balance);
			$('.pay-account-select').css('border-color', '#880000');
			return;
		}
		
		wallet.useAccount(from);
    	var remaining = balance.minus(amountRaw);
		var blk = new Block();
		var lastBlock = wallet.getLastNBlocks(from, 1)[0].getHash(true);
		
		blk.setSendParameters(lastBlock, to, remaining);
	    blk.build();
	    wallet.signBlock(blk);
	    blk.setAmount(amountRaw);
	    blk.setAccount(from);
	    
		//var blk = wallet.addPendingSendBlock(from, to, amountRaw);
		
		$('#confirm-pay').val('Paying ...').prop('disabled', true);
		workAndBroadcast(blk, {sendMail: $('#email-checkbox').val()}, function(err){
			if(err) {
				alertError(err);
				$('#confirm-pay').val('Confirm Payment').prop('disabled', 0);
				return;
			}
			
			wallet = null;
			setTimeout(function(){
				$('#pay-title').fadeOut(250);
				$('#pay-form').fadeOut(250, function() {
					$('#hash_link').html(blk.getHash(true));
					$('#hash_link').attr('href', 'https://raiblocks.net/block/index.php?h='+blk.getHash(true));	
					$('.pay-success').fadeIn();
				});
			}, 3000); // 3 seconds delay to make sure the block propagates through the network before the user having the link to the explorer
		});
	}
	
	function workAndBroadcast (blk, extraPayload = {}, callback = null)
	{
		var extra = '';
		for(let i in extraPayload)
		{
			extra += '&' + i + '=' + extraPayload[i];
		}
		$.post('/pay/workAndBroadcast', 'hash='+blk.getHash(true)+'&block='+blk.getJSONBlock()+extra, function(data) {
			if(data.status == 'success')
			{
				if(callback)
					callback();
			}
			else
			{
				console.error('Error broadcasting.');
				if(callback)
					callback(data.msg);
			}
		});
	}

	// raiwallet pay listeners
	$('#pay-login-button').click(signInAndPay);
	$('#confirm-pay').click(confirmPayment);
});
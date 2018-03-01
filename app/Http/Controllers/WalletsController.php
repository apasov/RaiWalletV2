<?php

namespace App\Http\Controllers;

use App\Wallet;
use App\PoW;
use App\LegacyWallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

use PragmaRX\Google2FA\Google2FA;
use Detection\MobileDetect;

use Mail;
use \App\Mail\RegistrationMail;
use App\Mail\RecoveryMail;

use App\Custom\RaiNode;

use Symfony\Component\HttpFoundation\Cookie;

class WalletsController extends Controller
{
    
    private $wallet;
    private $google2fa;
    private $cookies = [];
    
    public function __construct()
    {
         $this->google2fa = new Google2FA();
    }
    
    protected function registrationValidator(array $data)
    {
        return Validator::make($data, [
            'wallet' => 'required|string',
            'email' => 'required|string|email|max:255',
            'loginKey' => 'required|string'
        ]);
    }
    
    protected function validateIdentifier($identifier)
    {
        return preg_match( '/[a-fA-F0-9id_]/', $identifier);
    }
    
    protected function validate2fa($key, $code, $last_timestamp)
    {
        $timestamp = $this->google2fa->verifyKeyNewer($key, $code, $last_timestamp);
        if($timestamp === false)
            return false;
        
        $this->wallet->last2fa = $timestamp;
        $this->wallet->save();
        return true;
    }
    
    protected function validateBlockHash($hash)
    {
        if(strlen($hash) != 64)
            return false;
        if(!hex2bin($hash))
            return false;
        return true;
    }
    
    protected function get2faQrUrl($key, $name)
    {
        return $this->google2fa->getQRCodeGoogleUrl(
            'nanowallet.io',
            $name,
            $key
        ); 
    }
    
    protected function create(array $data)
    {
        // generate unique identifier for the wallet
        $identifier = 'id_' .  substr(hash('sha256', $data['email'] . $data['wallet'] . time()), 0, 64 - 3);
        $w = new Wallet();
        $w->identifier = $identifier;
        $w->wallet = $data['wallet'];
        $w->wallet_backup = $data['wallet'];
        $w->email = $data['email'];
        $w->login_key_salt = substr(hash('sha256', rand(0,10000000 . time())), 0, 16);
        $w->login_key_hash = hash('sha256', $w->login_key_salt . $data['loginKey']);
        $w->login_key_enabled = true;
        return $w;
    }
    
    protected function success($data = [])
    {
        if(!is_array($data))
            $data = [$data];
        $data = array_merge(['status' => 'success'], $data);
        $res = response()->json($data);
        if(count($this->cookies) > 0)
            foreach($this->cookies as $cookie)
                $res->cookie($cookie);
        return $res;
    }
    
    protected function error($msg)
    {
        return response()->json(['status' => 'error', 'msg' => $msg]);
    }
    
    protected function redirect($url)
    {
        return response()->json(['status' => 'redirect', 'location' => $url]);
    }
    
    public function register(Request $request)
    {  
        $validation = $this->registrationValidator($request->all());
        if ($validation->fails()) 
        {  
            return response()->json($validation->errors()->toArray());
        }
        else
        {
            $wallet = $this->create($request->all());
            $wallet->save();
            Auth::login($wallet);
            
            $ret = [];
            $ret['identifier'] = $wallet->identifier;
            
            $data = ['message' => 'This is a test!'];
            Mail::to($wallet->email)->send(new RegistrationMail($wallet->identifier));
            return $this->success($ret);
        }
    }
    
    public function login(Request $request)
    {
        $wallet = Wallet::where('identifier', $request->identifier)->orWhere('alias', $request->identifier)->first();
        if(!$wallet)
            return $this->error('Wallet not found. Are you introducing the correct identifier? A common mistake is introducing the email.');
        
        if($wallet->legacy)
        {
            $legacy = LegacyWallet::where('identifier', $wallet->identifier)->first();
            $wallet->wallet = $legacy->wallet;
            $wallet->save();
        }
        $this->wallet = $wallet;

        if($wallet->confirmed && $request->cookie('wallet_token') != $wallet->cookie_token)
        {
            // send authorize device mail
            
        }
        
        if($wallet->_2fa)
        {
            if($request->_2fa && $request->_2farequired == 1)
            {
                $valid = $this->validate2fa($wallet->_2fa_key, $request->_2fa, $wallet->last2fa);
                if(!$valid)
                    return $this->error('Invalid 2fa code.');
            }
            else 
            {
                return $this->success(['_2fa' => true]);
            }
        }
        
        if(!$wallet->login_key_enabled)
        {
            Auth::login($wallet);
        }
        
        $ret['wallet'] = $wallet->wallet;
        $ret['alias'] = $wallet->alias ? $wallet->alias : false;
        $ret['sign_out'] = $wallet->sign_out;
        $ret['_2fa'] = false;
        $ret['mobile'] = false;
        $ret['identifier'] = $wallet->identifier;
        
        $detect = new MobileDetect;
        if ( $detect->isMobile() || $detect->isTablet())
        {
            $ret['mobile'] = true;
        }
        
        return $this->success($ret);
    }
    
    public function recovery(Request $request)
    {
        $email = $request->email;
        if(filter_var($email, FILTER_VALIDATE_EMAIL) === false) 
            return $this->error('Invalid email address.');
        
        $wallets = Wallet::where('email', $email)->get();
        $wids = [];
        
        if(count($wallets) > 0)
        {
            foreach($wallets as $wallet)
            {
                $wids[] = $wallet->identifier;
            }
        
            Mail::to($email)->send(new RecoveryMail($wids));
        }
        
        $return['msg'] = 'If there is a wallet registered under this email address you should receive an email with its identifier.';
        return $this->success($return);
        
    }
    
    public function imLoggedIn(Request $request)
    {
        if($request->loginKey)
        {
            $wallet = Wallet::where('identifier', $request->identifier)->first();
            if(!$wallet)
                return $this->error('Invalid identifier');
            
            if($wallet->login_key_enabled)
            {
                if(hash('sha256', $wallet->login_key_salt . $request->loginKey) == $wallet->login_key_hash)
                {
                    Auth::login($wallet);
                }
                else
                {
                    $wallet->login_key_enabled = 0;
                    $wallet->save();
                    return $this->error('Invalid login key.');
                }
            }
            else 
            {
                // old wallet version, enable login key here
                $wallet->login_key_enabled = 1;
                $wallet->login_key_salt = substr(hash('sha256', rand(0,10000000 . time())), 0, 16);
                $wallet->login_key_hash = hash('sha256', $wallet->login_key_salt . $request->loginKey);
                if($request->wallet != 0) {
                    $wallet->wallet = $request->wallet;
                    $wallet->legacy = false;
                }
                $wallet->save();
                
                Auth::login($wallet);
            }
        }
        else 
        {
            return $this->error('Missing login key.');
        }
        
        $return = ['msg' => 'Login successful'];
        
        // extract 2fa keys and stuff
        if($wallet->_2fa == 1)
        {
            $return['_2fa_enabled'] = 1;
            $return['_2fa_qr_url'] = $this->get2faQrUrl($wallet->_2fa_key, $wallet->identifier);
            $return['_2fa_confirmed'] = 1;
        }

        // this is just to remember user identifier at payments.nanowallet.io without putting the identifier in the cookie
        // it's also used to determine if a given device is authorized to log in
        $wallet_token = hash('sha256', time() . $wallet->identifier);
        $wallet->cookie_token = $wallet_token;
        $this->cookies[] = cookie('wallet_token', $wallet_token, 60 * 24 * 90, null, '.nanowallet.io');
        $wallet->save();
        return $this->success($return);
    }
    
    // AUTHENTICATED METHODS FROM HERE
    
    public function getChains(Request $request)
    {
        $res = [];
        $node = new RaiNode();
        $accs = json_decode($request->accs, true);
        
        $frontiers = $node->accounts_frontiers(['accounts' => $accs])['frontiers'];
        foreach($accs as $account)
        {
            // get balance
            $balance = $node->account_balance(['account' => $account]);
            $res['accounts'][$account]['balance'] = $balance['balance'];
            $res['accounts'][$account]['pending'] = $balance['pending'];
            
            // get last 5 blocks
            if(isset($frontiers[$account]))
            {
                $chain = $node->chain(['block' => $frontiers[$account], 'count' => 500])['blocks'];
                $blocks = $node->blocks_info(['hashes' => $chain])['blocks'];
                $blocks2 = [];
                foreach($blocks as $hash=>$data)
                {
                    $contents = json_decode($data['contents'], true);
                    if($contents['type']=='open' || $contents['type']=='receive')
                    {
                          $data['origin'] = $node->block_account(['hash'=>$contents['source']])['account'];
                    }
                    $blk = array_merge(['hash' => $hash], $data);
                    $blocks2[] = $blk;
                }
                $res['accounts'][$account]['blocks'] = $blocks2;
            }
            else
            {
                $res['accounts'][$account]['blocks'] = [];
            }
        }
        return $this->success($res);
    }
    
    public function getPending(Request $request)
    {
        $accounts = json_decode($request->accounts, true);
        if(!$accounts)
            $this->error('');
        
        $node = new RaiNode();
        $pending = $node->accounts_pending(['accounts' => $accounts, 'count' => 10])['blocks'];
        $res = [];
        foreach($pending as $account => $hashes)
        {
            if(is_array($hashes) && count($hashes) > 0)
            {
                $blocks = [];
                foreach($hashes as $hash)
                {
                    $block = $node->blocks_info(['hashes' => [$hash]])['blocks'][$hash];
                    $amount = $block['amount'];
                    $from = $block['block_account'];
                    $blocks[] = ['amount' => $amount, 'from' => $from, 'hash' => $hash];
                }
                $res[$account]['account'] = $account;
                $res[$account]['blocks'] = $blocks;
            }
        }
        
        return $this->success(['res' => $res]);            
    }
    
    public function batchWork(Request $request)
    {
        $this->wallet = Auth::user();
        $batch = json_decode($request->batch, true);
        $workRes = [];
        
        if($batch)
        {
            foreach($batch as $hash)
            {
                $pow = PoW::where('hash', $hash)->first();
                if($pow)
                {
                    if($pow->work)
                    {
                        $res['work'] = $pow->work;
                        $res['hash'] = $hash;
                        $workRes[] = $res;
                    }
                }
                else
                {
                    $newPoW = new PoW();
                    $newPoW->hash = $hash;
                    $newPoW->wallet_id = $this->wallet->id;
                    $newPoW->save();
                }
            }
        }
        
        $return['workRes'] = $workRes;
        return $this->success($return);
    }
    
    public function remoteWork(Request $request)
    {
        $return['work'] = 0;
        $return['worked'] = false;
        
        if(!$this->validateBlockHash($request->hash))
            return $this->error('Invalid block hash');
        
        $pow = PoW::where('hash', $request->hash)->first();
        if($pow)
        {
            if($pow->work != null && $pow->work != 0)
            {
                $return['work'] = $pow->work;
                $return['worked'] = true;
            }
        }
        else
        {
            $pow = new PoW();
            $pow->hash = $request->hash;
            $pow->wallet_id = Auth::user()->id;
            $pow->save();
        }
        
        return $this->success($return);
    }
    
    public function getSingleWork(Request $request)
    {
        if(!$this->validateBlockHash($request->hash))
            return $this->error('Invalid block hash.');
        
        $pow = PoW::where('worked', 1)->where('hash', $request->hash)->first();
        if($pow)
        {
            $return['found'] = true;
            $return['worked'] = false;
            if($pow->work)
            {
                $return['worked'] = true;
                $return['work'] = $pow->work;
            }
        }
        else 
        {
            $return['found'] = false;
        }
        
        return $this->success($return);
    }
    
    public function changeAlias(Request $request)
    {
        $alias = $request->alias;
        $wallet = Auth::user();
        
        if(!ctype_alnum($alias) || strlen($alias) < 5 || strlen($alias) > 20)
            return $this->error('Invalid alias. Should be 5-20 characters long and can only contain alphanumeric characters and underscores.');

        if(Wallet::where('alias', $alias)->where('id', '!=', 1)->first())
        {
            return $this->error('Alias already taken.');
        }
        
        $wallet->alias = $alias;
        $wallet->save();
        
        $return['msg'] = 'Alias successfully changed.';
        return $this->success($return);
    }
    
    public function setSignOutTime(Request $request)
    {
        $wallet = Auth::user();
        
        if(!is_numeric($request->time))
            return $this->error('Invalid value');
        
        if($request->time < 5)
            return $this->error('Minimum auto sign out time is 5 minutes. You need to have some time available to click buttons and sutff :P');
        
        $wallet->sign_out = $request->time;
        $wallet->save();
        
        return $this->success(['msg' => "Preferences successfully updated."]);
    }
    
    public function enable2fa(Request $request)
    {
        $wallet = Auth::user();
        
        if($wallet->_2fa)
            return $this->error('2fa already enabled.');
        
        // generate new key
        $key = $this->google2fa->generateSecretKey(32);
        $wallet->_2fa_key = $key;
        $wallet->save();
        
        $return['_2fa_key'] = $key;
        $return['qr_url'] = $this->get2faQrUrl($key, $wallet->identifier);
        
        return $this->success($return);
    }
    
    public function confirm2fa(Request $request)
    {
        $wallet = Auth::user();
        $this->wallet = $wallet;
        
        $valid = $this->validate2fa($wallet->_2fa_key, $request->code, $wallet->last_2fa_code);
        if(!$valid)
            return $this->error('Invalid 2fa code.');
            
        $wallet->_2fa = true;
        $wallet->save();
        
        return $this->success(['msg' => '2fa successfully enabled.']);
    }
    
    public function disable2fa(Request $request)
    {
        $wallet = Auth::user();
        $this->wallet = $wallet;
        
        if(!$wallet->_2fa)
            return $this->error('2fa is not enabled.');
        
        if(!$request->code)
            return $this->error('Invalid 2fa code.');
        
        $valid = $this->validate2fa($wallet->_2fa_key, $request->code, $wallet->last_2fa_code);
        if($valid)
        {
            $wallet->_2fa = false;
            $wallet->_2fa_key = null;
            $wallet->save();
            return $this->success(['msg' => '2fa successfully disabled.']);
        }
        return $this->error('Invalid 2fa code.');
    }
    
    public function sync(Request $request)
    {
        $wallet = Auth::user();
        
        if(!hex2bin($request->data))
            return $this->error('Invalid hex wallet data');
            
        if($wallet->identifier != $request->identifier)
            return $this->redirect('/?err=INVALID_IDENTIIFER');
        
        if($wallet->legacy)
        {
            $wallet->wallet_backup = $request->data;
            $wallet->legacy = false;
        }
        $wallet->wallet = $request->data;
        $wallet->save();
        
        return $this->success();
    }
    
    public function broadcast(Request $request)
    {
        if(!$this->validateBlockHash($request->hash))
            return $this->error('Invalid block hash.');
        
        $block = json_decode($request->data, true);
        if(!$block)
            return $this->error('Invalid JSON block.');
        
        $node = new RaiNode();
        if($request->amount !== 'false')
        {
            // send block, check if the amount sent is the amount intended
            $account_balance = $node->account_balance(['account' => $node->block_account(['hash' => $block['previous']])['account']])['balance'];
            if($account_balance != $request->amount)
                return $this->error('Client account balance does not match actual balance. Sign out and in to resync your wallet. If the problem persists contact us.' . $account_balance);
        }
        
        // TODO: log block
        
        $res = $node->process(['block' => $request->data]);
        
        // TODO: check if this actually works in version 9
        if(empty($node->raw_response))
            return $this->error('Error broadcasting block. Node may be shut down.');
            
        // TODO: broadcast the block from multiple nodes
        $redundant_nodes = explode('|', env('REDUNDANT_NODES'));
        if(count($redundant_nodes) > 0)
        {
            foreach($redundant_nodes as $n)
            {
                if(strpos($n, ':') !== false)
                {
                    $explode = explode(':', $n);
                    $ip = $explode[0];
                    $port = $explode[1];
                }
                else
                {
                    $ip = $n;
                    $port = 7076; // default nano rpc port
                }

                if (filter_var($ip, FILTER_VALIDATE_IP))
                {
                    $node_2 = new RaiNode($ip, $port);
                    $node_2->process(['block' => $request->data]);
                }
            }
        }

        return $this->success();
    }
    
    public function rebroadcast(Request $request)
    {
        if(!$this->validateBlockHash($request->hash))
            return $this->error('Invalid block hash.');
        
        $node = new RaiNode();
        $node->republish(['hash' => $request->hash]);
        
        // TODO: broadcast the block from multiple nodes
        return $this->success();
    }
}

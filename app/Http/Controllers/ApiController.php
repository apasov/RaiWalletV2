<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Custom\RaiNode;

class ApiController extends Controller
{
	protected function validateBlockHash($hash)
    {
        if(strlen($hash) != 64)
            return false;
        if(!hex2bin($hash))
            return false;
        return true;
    }

    protected function success($data = [])
    {
        if(!is_array($data))
            $data = [$data];
        $data = array_merge(['status' => 'success'], $data);
        $res = response()->json($data);
        return $res;
    }

    protected function error($msg)
    {
        return response()->json(['status' => 'error', 'msg' => $msg]);
    }

    public function publicRebroadcast (Request $request)
    {
    	$block = $request->block;
    	$hash = $request->hash;

    	$block = json_decode($block);
    	if(!$block)
    		return $this->error('Invalid block data');
    	if(!$this->validateBlockHash($hash))
    		return $this->error('Invalid block hash');

    	$node = new RaiNode();
    	$res = $node->republish(['hash' => $hash]);
    	if(isset($res['error']))
    		$res = $node->process(['block' => $block]);
    	return $this->success();
    }
}

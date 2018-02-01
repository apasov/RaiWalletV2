<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::domain('pay.nanowallet.io')->group(function () {
    Route::get('/', 'PaymentsController@create');
    Route::post('/', 'PaymentsController@create');
    Route::group(['middleware' => 'auth'], function () {
        Route::post('/pay/workAndBroadcast', 'PaymentsController@workAndBroadcast');
    });
});

Route::get('/', function () {
    return view('index');
});

Route::get('/{url}', function ($url) {
    return Redirect::to('/');
})->where('url', '(home|settings|debug|transactions|security)'); // the pipe denotes 'or'

Route::post('/wallet/register', 'WalletsController@register');
Route::post('/wallet/login', 'WalletsController@login');
Route::post('/wallet/recovery', 'WalletsController@recovery');
Route::post('/wallet/imLoggedIn', 'WalletsController@imLoggedIn');
Route::get('/resources', function(){
   return Redirect::to('https://github.com/jaimehgb/RaiWalletV2/'); 
});

Route::group(['middleware' => 'auth'], function () {
    Route::post('/wallet/chains', 'WalletsController@getChains');
    Route::post('/wallet/pending', 'WalletsController@getPending');
    Route::post('/wallet/batchWork', 'WalletsController@batchWork');
    Route::post('/wallet/remoteWork', 'WalletsController@remoteWork');
    Route::post('/wallets/getSingleWork', 'WalletsController@getSingleWork');
    Route::post('/wallet/alias', 'WalletsController@changeAlias');
    Route::post('/wallet/setSignOut', 'WalletsController@setSignOutTime');
    Route::post('/wallet/enable2fa', 'WalletsController@enable2fa');
    Route::post('/wallet/confirm2fa', 'WalletsController@confirm2fa');
    Route::post('/wallet/disable2fa', 'WalletsController@disable2fa');
    Route::post('/wallet/sync', 'WalletsController@sync');
    Route::post('/wallet/broadcast', 'WalletsController@broadcast');
    Route::post('/wallet/rebroadcast', 'WalletsController@rebroadcast');
    
    Route::get('/out', function(){
        Auth::logout();
        return redirect('/');
    });
});

// public endpoints
Route::post('/api/broadcast', 'ApiController@publicRebroadcast');



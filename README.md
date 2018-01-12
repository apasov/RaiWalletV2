# RaiWalletV2

<h3>Installation</h3>
<p>
Check Laravel system requirements: <br/>
<a href="https://laravel.com/docs/5.5#server-requirements" target="_blank">https://laravel.com/docs/5.5#server-requirements</a><br/><br/>
Clone the repo somewhere and cd into it. Then:<br/>
<pre>
composer install
npm install --global gulp-cli
npm shrinkwrap
npm install
cp .env-example .env
</pre>
<p>
Then edit the .env file. Basically you need to add the DB settings. <a href="https://laravel.com/docs/5.5/database" target="_blank">Info here</a>
<br/>
Then:
</p>
<pre>
php artisan migrate
php artisan key:generate
gulp
</pre>
And run it with:
<pre>
php artisan serve
</pre>

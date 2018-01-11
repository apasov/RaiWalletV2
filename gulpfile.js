var elixir = require('laravel-elixir');

elixir(function(mix) {
    mix.scripts([
        '../../../node_modules/jquery/dist/jquery.min.js',
        '../../../vendor/twbs/bootstrap/dist/js/bootstrap.min.js',
        '../../../node_modules/jquery.easing/jquery.easing.min.js',
        '../../../node_modules/scrollreveal/src/scrollreveal.js',
        '../../../node_modules/jquery-toast-plugin/dist/jquery.toast.min.js',
        'resources/assets/js/creative.js',
        'Logger.js'
    ], 'public/js/app.js')
    .browserify('custom.js')
    .styles([
       '../../../vendor/twbs/bootstrap/dist/css/bootstrap.min.css',
       '../../../vendor/fortawesome/font-awesome/css/font-awesome.css',
       'resources/assets/css/creative.css',
       'resources/assets/css/sidebar.css',
       '../../../node_modules/jquery-toast-plugin/dist/jquery.toast.min.css'
    ], 'public/css/app.css');
});
var elixir = require('laravel-elixir');

elixir(function(mix) {
    mix.scripts([
        '../../../node_modules/jquery/dist/jquery.min.js',
        '../../../vendor/twbs/bootstrap/dist/js/bootstrap.min.js',
        '../../../node_modules/jquery.easing/jquery.easing.min.js',
        '../../../node_modules/scrollreveal/src/scrollreveal.js',
        '../../../node_modules/jquery-toast-plugin/dist/jquery.toast.min.js',
        'resources/assets/js/creative.js',
        'resources/assets/js/nano-webgl-pow.js',
        'Logger.js',
        'pow.js',
        'startThreads.js'
    ], 'public/js/app.js')
    .browserify('custom.js')
    .styles([
       '../../../vendor/twbs/bootstrap/dist/css/bootstrap.min.css',
       '../../../vendor/fortawesome/font-awesome/css/font-awesome.css',
       'resources/assets/css/creative.css',
       'resources/assets/css/sidebar.css',
       '../../../node_modules/jquery-toast-plugin/dist/jquery.toast.min.css'
    ], 'public/css/app.css')
    .copy('vendor/fortawesome/font-awesome/fonts/fontawesome-webfont.eot', 'public/fonts/fontawesome-webfont.eot')
    .copy('vendor/fortawesome/font-awesome/fonts/fontawesome-webfont.svg', 'public/fonts/fontawesome-webfont.svg')
    .copy('vendor/fortawesome/font-awesome/fonts/fontawesome-webfont.ttf', 'public/fonts/fontawesome-webfont.ttf')
    .copy('vendor/fortawesome/font-awesome/fonts/fontawesome-webfont.woff', 'public/fonts/fontawesome-webfont.woff')
    .copy('vendor/fortawesome/font-awesome/fonts/fontawesome-webfont.woff2', 'public/fonts/fontawesome-webfont.woff2')
    .copy('vendor/fortawesome/font-awesome/fonts/FontAwesome.otf', 'public/fonts/FontAwesome.otf')
    .copy('vendor/twbs/bootstrap/fonts/glyphicons-halflings-regular.eot', 'public/fonts/glyphicons-halflings-regular.eot')
    .copy('vendor/twbs/bootstrap/fonts/glyphicons-halflings-regular.svg', 'public/fonts/glyphicons-halflings-regular.svg')
    .copy('vendor/twbs/bootstrap/fonts/glyphicons-halflings-regular.ttf', 'public/fonts/glyphicons-halflings-regular.ttf')
    .copy('vendor/twbs/bootstrap/fonts/glyphicons-halflings-regular.woff', 'public/fonts/glyphicons-halflings-regular.woff')
    .copy('vendor/twbs/bootstrap/fonts/glyphicons-halflings-regular.woff2', 'public/fonts/glyphicons-halflings-regular.woff2')
    .copy('resources/assets/js/thread.js', 'public/js/thread.js')
    .copy('resources/assets/js/pow.js', 'public/js/pow.js')
    .copy('resources/assets/js/pow.wasm', 'public/pow.wasm')
    .copy('resources/assets/js/pow.wasm', 'public/js/pow.wasm');
});
require.config({
    baseUrl: "/js/lib",

    paths: {
        jquery: 'jquery-1.8.2.min',
        bootstrap: 'bootstrap.min',
        socketio: 'http://localhost:3000/socket.io/socket.io',
        ptsans: 'ptsans.font',
        highpass_filter : 'fabric.filters.highpass',
        convolution_filter : 'fabric.filters.convolution',
        fabric: 'fabric',
        //fileuploader: 'fileuploader',
        fileuploader : 'jquery.fileupload',
        app: '../app'
    },

    shim: {
        jquery: {
            exports: '$'
        },
        fileuploader : ['jquery'],
        bootstrap: ['jquery'],
        socketio: {
            exports: 'io'
        },
        ptsans : ['fabric'],
        highpass_filter : ['fabric'],
        convolution_filter : ['fabric'],
        fabric: {
            exports: 'fabric'
        },
        // fileuploader: {
        //     exports: 'qq'
        // }
    }
});

require(["app/boot"], function(app) {
    console.log(app);
});


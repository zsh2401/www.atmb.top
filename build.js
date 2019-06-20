var libjaderender = require('./jade/render');
// var spawn = require('child_process').spawn;
function renderJade(){
    console.log('jades is building');
    libjaderender.render();
    console.log('jades have been built');
}
function compileTSLib(){
    console.log('Compiling TypeScript libs');
    // spawn();
    console.log('Compiled TypeScript libs');
}
renderJade();
compileTSLib();

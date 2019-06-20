var libjaderender = require('./jade/render');
function renderJade(){
    console.log('jades is building');
    libjaderender.render();
    console.log('jades have been built');
}
function compileTSLib(){
    console.log('Compiling TypeScript libs');
    console.log('Compiled TypeScript libs');
}
renderJade();
compileTSLib();

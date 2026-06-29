process.on('uncaughtException', (err) => {
    console.error('=== UNCAUGHT EXCEPTION ===');
    console.error(err);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error('=== UNHANDLED REJECTION ===');
    console.error(reason);
    process.exit(1);
});

console.log('Chargement...');
require('./dist/main.js');

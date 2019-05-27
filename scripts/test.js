
function test() {
    return new Promise(s => {
        setTimeout(() => {
            s(true);
        }, 5000);
    });
}
(async function aa(){
await test();
console.log("test");
})()

var latch = require('./latch.js');
latch.init({
        appId: "Hr2cq2ei9xPsiYw3RMqu",
        secretKey: "QFhKgYhExZVnPAwgwnqZCczLbAdpThB787mMH3Fx"
    });
latch.unpair("ynvLvieBxbER4Bim6d72fbvYKv4Ek6BGFPY3jQucuvrHr6gtVZhjNweaCY3uacCH", function(res){
	console.log("res", res);
});
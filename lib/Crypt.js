var crypto = require('crypto');  


function crypt_des(param) {  
    var key = new Buffer(param.key);  
    var iv = new Buffer(param.iv ? param.iv : 0)  
    var plaintext = param.plaintext  
    var alg = param.alg  
    var autoPad = param.autoPad  

    //encrypt  
    var cipher = crypto.createCipheriv(alg, key, iv);  
    cipher.setAutoPadding(autoPad)  //default true      
    var ciph = cipher.update(plaintext, 'utf8', 'hex');  
    ciph += cipher.final('hex');  
    // console.log(alg, ciph)  
    return ciph
}  
module.exports = crypt_des
// crypt_des({  
//     alg: 'des-ede3',    //3des-ecb  
//     autoPad: true,  
//     key: '123456000000000000000000',  
//     plaintext: '1234567$1234567890$7572045$0010029900D04940000180A1D7F3599D$192.168.1.133$70-E2-4C-68-31-DD$$CTC',  
//     iv: null  
// });
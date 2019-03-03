var demoContract = artifacts.require("demoContract");

contract('demoContract', function(){
     it('Should create a contract', function(){
         return demoContract.deployed().then(function(instance){
             return instance.init("96ee79ae456dac1e67515cb0f5bd222fdf36b497","b6b49266d3f5bab339f29f93de9658f67891c225",1999,1,1);   
         });
    });
    it('Should get the created contract', function(){
        return demoContract.deployed().then(function(instance){
            return instance.covenant.call();   
        }).then(function(covenant){
            assert.equal(covenant.valueOf(), "0x96ee79ae456dac1e67515cb0f5bd222fdf36b497", "Not initialized properly.")
        });
    });
});
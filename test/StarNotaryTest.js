
const assert = require('assert');

const StarNotary = artifacts.require("StarNotary");

let instance;

contract('StarNotary', function(accounts) {
    let owner = accounts[0];

    beforeEach(async function() {
        instance = await StarNotary.deployed();
    });

    it('can create a star', async function() {
        let tokenId = 1;
        let expectedStarName = 'Awesome Star!';
        await instance.createStar(expectedStarName, tokenId, {from: owner});
        let starName = await instance.tokenIdToStarInfo.call(tokenId);
        assert.strictEqual(starName, expectedStarName);
    });

    it('lets users put their star for sale', async function() {
        let user1 = accounts[1];
        let starId = 2;
        let expectedStarPrice = web3.utils.toWei(".01", "ether");
        await instance.createStar("Awesome Star!", starId, {from: user1});
        await instance.putStarUpForSale(starId, expectedStarPrice, {from: user1});
        let starPrice = await instance.starsForSale.call(starId)
        assert.strictEqual(starPrice.toString(), expectedStarPrice)
    });

    it('lets user pay and get paid for sale of star', async function() {
        let user1 = accounts[1];
        let user2 = accounts[2];
        let starId = 3;
        let starPrice = web3.utils.toWei(".01", "ether");
        await instance.createStar("Awesome Star!", starId, {from: user1});
        await instance.putStarUpForSale(starId, starPrice, {from: user1});
        
        let user1BalanceBeforeTransaction = await web3.eth.getBalance(user1)
        let user2BalanceBeforeTransaction = await web3.eth.getBalance(user2)
        await instance.buyStar(starId, {from: user2, value: starPrice, gasPrice: 0})
        let user1BalanceAfterTransaction = await web3.eth.getBalance(user1)
        let user2BalanceAfterTransaction = await web3.eth.getBalance(user2)
        
        var user1ExpectedBalance = Number(user1BalanceBeforeTransaction) + Number(starPrice);
        var user1Balance = Number(user1BalanceAfterTransaction);
        assert.strictEqual(user1Balance, user1ExpectedBalance)

        var user2ExpectedBalance = Number(user2BalanceBeforeTransaction) - Number(starPrice);
        var user2Balance = Number(user2BalanceAfterTransaction);
        assert.strictEqual(user2Balance, user2ExpectedBalance)

        let newOwner = await instance.ownerOf.call(starId)
        assert.strictEqual(newOwner, user2)
    });

    // Implement Task 2 Add supporting unit tests

    it('can add the star name and star symbol properly', async() => {
        // 1. create a Star with different tokenId
        //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    });

    it('lets 2 users exchange stars', async() => {
        // 1. create 2 Stars with different tokenId
        // 2. Call the exchangeStars functions implemented in the Smart Contract
        // 3. Verify that the owners changed
    });

    it('lets a user transfer a star', async() => {
        // 1. create a Star with different tokenId
        // 2. use the transferStar function implemented in the Smart Contract
        // 3. Verify the star owner changed.
    });

    it('lookUptokenIdToStarInfo test', async() => {
        // 1. create a Star with different tokenId
        // 2. Call your method lookUptokenIdToStarInfo
        // 3. Verify if you Star name is the same
    });
})
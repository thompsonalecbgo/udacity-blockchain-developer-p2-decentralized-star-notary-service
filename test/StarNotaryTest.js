
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

        let starOwner = await instance.ownerOf.call(tokenId)
        assert.strictEqual(starOwner, owner)
    });

    it('lets users put their star for sale', async function() {
        let user1 = accounts[1];
        let starId = 2;
        await instance.createStar("Awesome Star!", starId, {from: user1});

        let expectedStarPrice = web3.utils.toWei(".01", "ether");
        await instance.putStarUpForSale(starId, expectedStarPrice, {from: user1});

        let starPrice = await instance.starsForSale.call(starId)
        assert.strictEqual(starPrice.toString(), expectedStarPrice)
    });

    it('lets user1 get the funds after the sale', async function() {
        let user1 = accounts[1];
        let user2 = accounts[2];
        let starId = 3;
        await instance.createStar("Awesome Star!", starId, {from: user1});

        let starPrice = web3.utils.toWei(".01", "ether");
        await instance.putStarUpForSale(starId, starPrice, {from: user1});
        
        let user1BalanceBeforeTransaction = await web3.eth.getBalance(user1)
        await instance.buyStar(starId, {from: user2, value: starPrice, gasPrice: 0})
        let user1BalanceAfterTransaction = await web3.eth.getBalance(user1)
        
        var user1ExpectedBalance = Number(user1BalanceBeforeTransaction) + Number(starPrice);
        var user1Balance = Number(user1BalanceAfterTransaction);
        assert.strictEqual(user1Balance, user1ExpectedBalance)
    });

    it('lets user2 buy a star, if it is put up for sale', async function() {
        let user1 = accounts[1];
        let user2 = accounts[2];
        let starId = 4;
        await instance.createStar("Awesome Star!", starId, {from: user1});

        let starPrice = web3.utils.toWei(".01", "ether");
        await instance.putStarUpForSale(starId, starPrice, {from: user1});
        
        await instance.buyStar(starId, {from: user2, value: starPrice, gasPrice: 0})
        
        let newOwner = await instance.ownerOf.call(starId)
        assert.strictEqual(newOwner, user2)
    });

    it('lets user2 buy a star and decreases its balance in ether', async function() {
        let user1 = accounts[1];
        let user2 = accounts[2];
        let starId = 5;
        await instance.createStar("Awesome Star!", starId, {from: user1});

        let starPrice = web3.utils.toWei(".01", "ether");
        await instance.putStarUpForSale(starId, starPrice, {from: user1});
        
        let user2BalanceBeforeTransaction = await web3.eth.getBalance(user2)
        await instance.buyStar(starId, {from: user2, value: starPrice, gasPrice: 0})
        let user2BalanceAfterTransaction = await web3.eth.getBalance(user2)

        var user2ExpectedBalance = Number(user2BalanceBeforeTransaction) - Number(starPrice);
        var user2Balance = Number(user2BalanceAfterTransaction);
        assert.strictEqual(user2Balance, user2ExpectedBalance)
    });

    // Implement Task 2 Add supporting unit tests

    it('can add the star name and star symbol properly', async() => {
        // 1. create a Star with different tokenId
        let starId = 6;
        await instance.createStar("Awesome Star!", starId);
        
        // 2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
        assert.strictEqual(await instance.name.call(), "CryptoStarz")
        assert.strictEqual(await instance.symbol.call(), "STAR")
    });

    it('lets 2 users exchange stars', async() => {
        // 1. create 2 Stars with different tokenId
        let user1 = accounts[1];
        let user2 = accounts[2];
        let starId1 = 7;
        let starId2 = 8;
        await instance.createStar("Awesome Star 1!", starId1, {from: user1});
        await instance.createStar("Awesome Star 2!", starId2, {from: user2});
        
        // 2. Call the exchangeStars functions implemented in the Smart Contract
        let star1OldOwner = await instance.ownerOf.call(starId1)
        let star2OldOwner = await instance.ownerOf.call(starId2)
        await instance.exchangeStars(starId1, starId2, {from: user1});
        let star1NewOwner = await instance.ownerOf.call(starId1)
        let star2NewOwner = await instance.ownerOf.call(starId2)

        // 3. Verify that the owners changed
        assert.notStrictEqual(star1OldOwner, star1NewOwner)
        assert.notStrictEqual(star2OldOwner, star2NewOwner)
        assert.strictEqual(star1NewOwner, user2)
        assert.strictEqual(star2NewOwner, user1)
    });

    it('lets a user transfer a star', async() => {
        // 1. create a Star with different tokenId
        let user1 = accounts[1];
        let user2 = accounts[2];
        let tokenId = 9;
        await instance.createStar("Awesome Star!", tokenId, {from: user1});

        // 2. use the transferStar function implemented in the Smart Contract
        let oldStarOwner = await instance.ownerOf.call(tokenId)
        await instance.transferStar(user2, tokenId, {from: user1})
        let newStarOwner = await instance.ownerOf.call(tokenId)

        // 3. Verify the star owner changed.
        assert.strictEqual(oldStarOwner, user1)
        assert.strictEqual(newStarOwner, user2)
    });

    it('lookUptokenIdToStarInfo test', async() => {
        // 1. create a Star with different tokenId
        let expectedStarName = "Really Awesome Star!"
        let tokenId = 10;
        await instance.createStar(expectedStarName, tokenId, {from: owner});

        // 2. Call your method lookUptokenIdToStarInfo
        let starName = await instance.lookUptokenIdToStarInfo(tokenId)

        // 3. Verify if you Star name is the same
        assert.strictEqual(starName, expectedStarName)
    });
})
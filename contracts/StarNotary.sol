// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.9.0;

//Importing openzeppelin-solidity ERC-721 implemented Standard
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// StarNotary Contract declaration inheritance the ERC721 openzeppelin implementation
contract StarNotary is ERC721 {
    
    // Star data
    struct Star {
        string name;
    }

    // mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;

    // Implement Task 1 Add a name and symbol properties
    // name: Is a short name to your token
    // symbol: Is a short string like 'USD' -> 'American Dollar'
    constructor() public ERC721("CryptoStarz", "STAR") {}

    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId) public {
        Star memory newStar = Star(_name);
        tokenIdToStarInfo[_tokenId] = newStar;
        _safeMint(msg.sender, _tokenId);
    }

    // Put a Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sell the Star you don't owned");
        starsForSale[_tokenId] = _price;
    }

    // Buy a Star that is for sale
    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");

        uint256 starCost = starsForSale[_tokenId];
        address starOwner = ownerOf(_tokenId);
        require(msg.value >= starCost, "You need to have enough Ether");

        _safeTransfer(starOwner, msg.sender, _tokenId, "");
        payable(starOwner).transfer(starCost);
        
        if(msg.value > starCost) {
            payable(msg.sender).transfer(msg.value - starCost);
        }

        starsForSale[_tokenId] = 0;
    }

    // Implement Task 1 lookUptokenIdToStarInfo
    function lookUptokenIdToStarInfo (uint _tokenId) public view returns (string memory) {
        // Stars should exist
        require(_tokenId > 0, "You can't transfer the star that don't exist");
        //1. You should return the Star saved in tokenIdToStarInfo mapping
        return tokenIdToStarInfo[_tokenId].name;
    }

    // Implement Task 1 Exchange Stars function
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        //3. Get the owner of the two tokens (ownerOf(_tokenId1), ownerOf(_tokenId1)
        address star1Owner = ownerOf(_tokenId1);
        address star2Owner = ownerOf(_tokenId2);

        // Stars should exist
        require((_tokenId1 > 0) && (_tokenId2 > 0), "You can't exchange stars that don't exist");

        //1. Passing to star tokenId you will need to check if the owner of _tokenId1 or _tokenId2 is the sender
        require((star1Owner == msg.sender) || (star2Owner == msg.sender), "You can't exchange stars you don't owned");

        //2. You don't have to check for the price of the token (star)
        
        //4. Use _transferFrom function to exchange the tokens.
        _safeTransfer(star1Owner, star2Owner, _tokenId1, "");
        _safeTransfer(star2Owner, star1Owner, _tokenId2, "");
    }

    // Implement Task 1 Transfer Stars
    function transferStar(address _to, uint256 _tokenId) public {
        // To address should exist
        require(_to != address(0), "You can't transfer the star to address that don't exist");

        // Stars should exist
        require(_tokenId > 0, "You can't transfer the star that don't exist");

        //1. Check if the sender is the ownerOf(_tokenId)
        require(ownerOf(_tokenId) == msg.sender, "You can't transfer the star you don't owned");

        //2. Use the transferFrom(from, to, tokenId); function to transfer the Star
        _safeTransfer(msg.sender, _to, _tokenId, "");
    }
}
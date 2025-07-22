// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VibeToken is ERC20, Ownable {
    mapping(address => bool) public hasClaimed;
    mapping(address => uint256) public claimTimestamp;
    mapping(address => uint256) public claimAmount;
    
    event TokensClaimed(address indexed user, uint256 amount, uint256 aqi);
    
    constructor() ERC20("VIBE Token", "VIBE") Ownable(msg.sender) {
        // 铸造初始供应量给合约部署者
        _mint(msg.sender, 1000000 * 10**decimals());
    }
    
    function claimTokens(uint256 aqi) external {
        require(!hasClaimed[msg.sender], "Address has already claimed tokens");
        
        uint256 amount;
        if (aqi > 50) {
            amount = 50 * 10**decimals();
        } else {
            amount = 20 * 10**decimals();
        }
        
        require(balanceOf(owner()) >= amount, "Insufficient tokens in contract");
        
        hasClaimed[msg.sender] = true;
        claimTimestamp[msg.sender] = block.timestamp;
        claimAmount[msg.sender] = amount;
        
        _transfer(owner(), msg.sender, amount);
        
        emit TokensClaimed(msg.sender, amount, aqi);
    }
    
    function checkClaimStatus(address user) external view returns (bool claimed, uint256 timestamp, uint256 amount) {
        return (hasClaimed[user], claimTimestamp[user], claimAmount[user]);
    }
    
    function resetClaim(address user) external onlyOwner {
        hasClaimed[user] = false;
        claimTimestamp[user] = 0;
        claimAmount[user] = 0;
    }
    
    function withdrawTokens(uint256 amount) external onlyOwner {
        require(balanceOf(address(this)) >= amount, "Insufficient balance");
        _transfer(address(this), owner(), amount);
    }
}
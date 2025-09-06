// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AssetManager.sol";

contract AssetLocker {
    AssetManager public assetManager;

    struct LockedAsset {
        uint256 assetId;
        uint256 unlockTime;
        address originalOwner;
        bool withdrawn;
    }

    mapping(uint256 => LockedAsset) public lockedAssets;

    event AssetLocked(uint256 indexed assetId, address indexed owner, uint256 unlockTime);
    event AssetWithdrawn(uint256 indexed assetId, address indexed owner);

    constructor(address _assetManager) {
        require(_assetManager != address(0), "Invalid AssetManager address");
        assetManager = AssetManager(_assetManager);
    }

    function lockAsset(uint256 _assetId, uint256 _seconds) public {
        address owner = assetManager.getAssetOwner(_assetId);
        require(owner == msg.sender, "Not the asset owner");

        // Transfer asset to this contract
        assetManager.transferAsset(_assetId, address(this));

        uint256 unlockTime = block.timestamp + _seconds;
        lockedAssets[_assetId] = LockedAsset(_assetId, unlockTime, msg.sender, false);

        emit AssetLocked(_assetId, msg.sender, unlockTime);
    }

    function lockAssets(uint256[] memory _assetIds, uint256 _seconds) public {
        for (uint256 i = 0; i < _assetIds.length; i++) {
            lockAsset(_assetIds[i], _seconds);
        }
    }

    function withdraw(uint256 _assetId) public {
        LockedAsset storage la = lockedAssets[_assetId];
        require(la.assetId != 0, "Asset not locked");
        require(block.timestamp >= la.unlockTime, "Asset is still locked");
        require(!la.withdrawn, "Already withdrawn");
        require(la.originalOwner == msg.sender, "Not original owner");

        la.withdrawn = true;

        // Transfer asset back to original owner
        assetManager.transferAsset(_assetId, la.originalOwner);

        emit AssetWithdrawn(_assetId, la.originalOwner);
    }

    function getLockedAsset(uint256 _assetId) public view returns (uint256, uint256, address, bool) {
        LockedAsset memory la = lockedAssets[_assetId];
        return (la.assetId, la.unlockTime, la.originalOwner, la.withdrawn);
    }
}

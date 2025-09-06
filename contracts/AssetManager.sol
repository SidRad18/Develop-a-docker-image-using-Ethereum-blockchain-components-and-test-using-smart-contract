// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AssetManager {
    struct Asset {
        uint256 id;
        string name;
        address owner;
    }

    mapping(uint256 => Asset) public assets;
    uint256 public assetCount;

    event AssetRegistered(uint256 indexed id, string name, address indexed owner);
    event AssetTransferred(uint256 indexed id, address indexed from, address indexed to);

    function registerAsset(string memory _name) public {
        assetCount++;
        assets[assetCount] = Asset(assetCount, _name, msg.sender);
        emit AssetRegistered(assetCount, _name, msg.sender);
    }

    function getAsset(uint256 _assetId) public view returns (uint256, string memory, address) {
        Asset memory a = assets[_assetId];
        return (a.id, a.name, a.owner);
    }

    function getAssetOwner(uint256 _assetId) public view returns (address) {
        return assets[_assetId].owner;
    }

    function transferAsset(uint256 _assetId, address newOwner) public {
        Asset storage a = assets[_assetId];
        require(msg.sender == a.owner, "Not the asset owner");
        require(newOwner != address(0), "Invalid new owner");

        address oldOwner = a.owner;
        a.owner = newOwner;

        emit AssetTransferred(_assetId, oldOwner, newOwner);
    }
}

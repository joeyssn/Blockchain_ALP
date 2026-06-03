// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ProductAuthenticity {
    struct Product {
        uint256 id;
        string productCode;
        string productName;
        bool authentic;
        address registeredBy;
        address currentOwner;
        bool exists;
    }

    address public owner;
    uint256 public productCount;
    uint256 private activeProductCount;

    mapping(uint256 => Product) public products;
    mapping(string => uint) public productCodeToId;

    event ProductRegistered(
        uint256 indexed productId,
        string productCode,
        string productName,
        address indexed registeredBy,
        address indexed currentOwner
    );

    event ProductUpdated(
        uint256 indexed productId,
        string productName,
        bool authentic
    );

    event ProductRemoved(
        uint256 indexed productId
    );

    event OwnershipTransferred(
        uint256 indexed productId,
        address indexed oldOwner,
        address indexed newOwner
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    modifier productExists(uint256 _id) {
        require(products[_id].exists, "Product does not exist");
        _;
    }

    modifier onlyProductOwner(uint256 _id) {
        require(
            msg.sender == products[_id].currentOwner,
            "Not product owner"
        );
        _;
    }

    // =========================
    // CONSTRUCTOR
    // =========================

    constructor() {
        owner = msg.sender;
    }

    function registerProduct(
        string memory _productCode,
        string memory _productName,
        address _productOwner
    )
        public
        onlyOwner
    {
        require(bytes(_productCode).length > 0, "Product code required");
        require(bytes(_productName).length > 0, "Product name required");
        require(
            productCodeToId[_productCode] == 0,
            "Product code already exists"
        );

        require(
            _productOwner != address(0),
            "Invalid owner address"
        );

        productCount++;
        activeProductCount++;

        products[productCount] = Product({
            id: productCount,
            productCode: _productCode,
            productName: _productName,
            authentic: true,
            registeredBy: msg.sender,
            currentOwner: _productOwner,
            exists: true
        });

        productCodeToId[_productCode] = productCount;

        emit ProductRegistered(
            productCount,
            _productCode,
            _productName,
            msg.sender,
            _productOwner
        );
    }

    function verifyProduct(
        string memory _productCode
    )
        public
        view
        returns(bool)
    {
        uint id = productCodeToId[_productCode];

        if(id == 0) {
            return false;
        }

        if(!products[id].exists) {
            return false;
        }

        return products[id].authentic;
    }

    function getProduct(
        uint256 _id
    )
        public
        view
        productExists(_id)
        returns(
            uint,
            string memory,
            string memory,
            bool,
            address,
            address
        )
    {
        Product memory p = products[_id];

        return (
            p.id,
            p.productCode,
            p.productName,
            p.authentic,
            p.registeredBy,
            p.currentOwner
        );
    }

    function updateProduct(
        uint256 _id,
        string memory _newName,
        bool _authentic
    )
        public
        onlyOwner
        productExists(_id)
    {
        require(bytes(_newName).length > 0, "Product name required");

        Product storage p = products[_id];

        p.productName = _newName;
        p.authentic = _authentic;

        emit ProductUpdated(_id, _newName, _authentic);
    }

    function removeProduct(
        uint256 _id
    )
        public
        onlyOwner
        productExists(_id)
    {
        Product storage p = products[_id];

        p.exists = false;
        p.authentic = false;
        productCodeToId[p.productCode] = 0;
        activeProductCount--;

        emit ProductRemoved(_id);
    }

    function transferOwnership(
        uint256 _id,
        address _newOwner
    )
        public
        productExists(_id)
        onlyProductOwner(_id)
    {
        require(
            _newOwner != address(0),
            "Invalid address"
        );

        address oldOwner = products[_id].currentOwner;

        products[_id].currentOwner = _newOwner;

        emit OwnershipTransferred(
            _id,
            oldOwner,
            _newOwner
        );
    }

    function getAllProducts()
        public
        view
        returns(Product[] memory)
    {
        Product[] memory allProducts =
            new Product[](activeProductCount);
        uint256 index = 0;

        for(uint256 i = 1; i <= productCount; i++) {
            if(products[i].exists) {
                allProducts[index] = products[i];
                index++;
            }
        }

        return allProducts;
    }
}

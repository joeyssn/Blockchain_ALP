// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ProductAuthenticity {

    // =========================
    // STRUCT
    // =========================

    struct Product {
        uint id;
        string productCode;
        string productName;
        string category;
        string brand;
        bool authentic;
        bool exists;
        address registeredBy;
        address currentOwner;
    }

    // =========================
    // STATE VARIABLES
    // =========================

    address public owner;
    uint public productCount;

    mapping(uint => Product) public products;
    mapping(string => uint) public productCodeToId;

    // =========================
    // EVENTS
    // =========================

    event ProductRegistered(
        uint productId,
        string productCode,
        string productName
    );

    event ProductUpdated(
        uint productId
    );

    event ProductRemoved(
        uint productId
    );

    event OwnershipTransferred(
        uint productId,
        address oldOwner,
        address newOwner
    );

    event AuthenticityChanged(
        uint productId,
        bool authentic
    );

    // =========================
    // MODIFIERS
    // =========================

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    modifier productExists(uint _id) {
        require(products[_id].exists, "Product does not exist");
        _;
    }

    modifier onlyProductOwner(uint _id) {
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

    // =========================
    // FUNCTION 1
    // REGISTER PRODUCT
    // =========================

    function registerProduct(
        string memory _productCode,
        string memory _productName,
        string memory _category,
        string memory _brand,
        address _productOwner
    )
        public
        onlyOwner
    {
        require(
            productCodeToId[_productCode] == 0,
            "Product code already exists"
        );

        require(
            _productOwner != address(0),
            "Invalid owner address"
        );

        productCount++;

        products[productCount] = Product({
            id: productCount,
            productCode: _productCode,
            productName: _productName,
            category: _category,
            brand: _brand,
            authentic: true,
            exists: true,
            registeredBy: msg.sender,
            currentOwner: _productOwner
        });

        productCodeToId[_productCode] = productCount;

        emit ProductRegistered(
            productCount,
            _productCode,
            _productName
        );
    }

    // =========================
    // FUNCTION 2
    // VERIFY PRODUCT
    // =========================

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

        return products[id].authentic;
    }

    // =========================
    // FUNCTION 3
    // GET PRODUCT
    // =========================

    function getProduct(
        uint _id
    )
        public
        view
        productExists(_id)
        returns(
            uint,
            string memory,
            string memory,
            string memory,
            string memory,
            bool,
            address
        )
    {
        Product memory p = products[_id];

        return (
            p.id,
            p.productCode,
            p.productName,
            p.category,
            p.brand,
            p.authentic,
            p.currentOwner
        );
    }

    // =========================
    // FUNCTION 4
    // UPDATE PRODUCT
    // =========================

    function updateProduct(
        uint _id,
        string memory _newName,
        string memory _newCategory,
        string memory _newBrand
    )
        public
        onlyOwner
        productExists(_id)
    {
        Product storage p = products[_id];

        p.productName = _newName;
        p.category = _newCategory;
        p.brand = _newBrand;

        emit ProductUpdated(_id);
    }

    // =========================
    // FUNCTION 5
    // REMOVE PRODUCT
    // =========================

    function removeProduct(
        uint _id
    )
        public
        onlyOwner
        productExists(_id)
    {
        products[_id].exists = false;

        emit ProductRemoved(_id);
    }

    // =========================
    // FUNCTION 6
    // TRANSFER OWNERSHIP
    // =========================

    function transferOwnership(
        uint _id,
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

    // =========================
    // FUNCTION 7
    // TOGGLE AUTHENTICITY
    // =========================

    function toggleAuthenticity(
        uint _id,
        bool _status
    )
        public
        onlyOwner
        productExists(_id)
    {
        products[_id].authentic = _status;

        emit AuthenticityChanged(
            _id,
            _status
        );
    }

    // =========================
    // FUNCTION 8
    // GET ALL PRODUCTS
    // =========================

    function getAllProducts()
        public
        view
        returns(Product[] memory)
    {
        Product[] memory allProducts =
            new Product[](productCount);

        for(uint i = 0; i < productCount; i++) {
            allProducts[i] = products[i + 1];
        }

        return allProducts;
    }
}
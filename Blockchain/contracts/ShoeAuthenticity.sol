// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ShoeAuthenticity {
    struct Company {
        address wallet;
        string companyName;
        bool approved;
    }

    struct Shoe {
        string productCode;
        string brand;
        string model;
        uint256 releaseYear;
        address companyWallet;
        bool authentic;
    }

    address public admin;
    uint256 public registrationFee;
    uint256 public verificationFee;
    uint256 public registrationFeesCollected;
    uint256 public verificationFeesCollected;
    uint256 public totalTransactions;

    mapping(address => Company) public companies;
    mapping(string => Shoe) private shoes;
    mapping(string => bool) private shoeExists;
    mapping(address => string[]) private companyShoeCodes;

    address[] private companyWallets;
    string[] private shoeCodes;

    event CompanyRegistered(address companyWallet);
    event ShoeRegistered(string productCode, string brand);
    event ShoeUpdated(string productCode);
    event ShoeVerified(string productCode, bool authentic);
    event ProductRegistered(string shoeCode, address company);
    event ProductVerified(string shoeCode, address verifier);
    event FeeCollected(address payer, uint256 amount, string transactionType);
    event FeesWithdrawn(address owner, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyApprovedCompany() {
        require(companies[msg.sender].approved, "Company is not registered or approved");
        _;
    }

    constructor() {
        admin = msg.sender;
        registrationFee = 0.0001 ether;
        verificationFee = 0.00005 ether;
        _registerTrustedCompany(0xd8264294B27C43E5944A6932c7A27D885CB5c758, "Nike");
        _registerTrustedCompany(0x12Ee27D5b5B5e74D2AD1CfD9020C943B9e121D03, "Adidas");
        _registerTrustedCompany(0x0c766c042ABf07f93dcdd06e9d1637d817dE7A63, "Puma");
    }

    function _registerTrustedCompany(address _wallet, string memory _companyName) private {
        companies[_wallet] = Company({
            wallet: _wallet,
            companyName: _companyName,
            approved: true
        });
        companyWallets.push(_wallet);
        emit CompanyRegistered(_wallet);
    }

    function registerCompany(string memory _companyName) public {
        require(bytes(_companyName).length > 0, "Company name required");
        require(companies[msg.sender].wallet == address(0), "Company already registered");

        companies[msg.sender] = Company({
            wallet: msg.sender,
            companyName: _companyName,
            approved: true
        });

        companyWallets.push(msg.sender);

        emit CompanyRegistered(msg.sender);
    }

    function setCompanyApproval(address _companyWallet, bool _approved) public onlyAdmin {
        require(companies[_companyWallet].wallet != address(0), "Company not registered");
        companies[_companyWallet].approved = _approved;
    }

    function addShoe(
        string memory _productCode,
        string memory _brand,
        string memory _model,
        uint256 _releaseYear
    ) public payable onlyApprovedCompany {
        require(msg.value >= registrationFee, "Insufficient registration fee");
        require(bytes(_productCode).length > 0, "Product code required");
        require(bytes(_brand).length > 0, "Brand required");
        require(bytes(_model).length > 0, "Model required");
        require(!shoeExists[_productCode], "Product code already exists");

        shoes[_productCode] = Shoe({
            productCode: _productCode,
            brand: _brand,
            model: _model,
            releaseYear: _releaseYear,
            companyWallet: msg.sender,
            authentic: true
        });

        shoeExists[_productCode] = true;
        shoeCodes.push(_productCode);
        companyShoeCodes[msg.sender].push(_productCode);
        registrationFeesCollected += msg.value;
        totalTransactions += 1;

        emit ShoeRegistered(_productCode, _brand);
        emit ProductRegistered(_productCode, msg.sender);
        emit FeeCollected(msg.sender, msg.value, "registration");
    }

    function updateShoe(
        string memory _productCode,
        string memory _brand,
        string memory _model,
        uint256 _releaseYear,
        bool _authentic
    ) public onlyApprovedCompany {
        require(shoeExists[_productCode], "Shoe does not exist");
        require(shoes[_productCode].companyWallet == msg.sender, "Only registering company can update shoe");
        require(bytes(_brand).length > 0, "Brand required");
        require(bytes(_model).length > 0, "Model required");

        Shoe storage shoe = shoes[_productCode];
        shoe.brand = _brand;
        shoe.model = _model;
        shoe.releaseYear = _releaseYear;
        shoe.authentic = _authentic;

        emit ShoeUpdated(_productCode);
    }

    function verifyShoe(string memory _productCode) public payable returns (bool) {
        require(msg.value >= verificationFee, "Insufficient verification fee");
        bool authentic = shoeExists[_productCode] && shoes[_productCode].authentic;
        verificationFeesCollected += msg.value;
        totalTransactions += 1;
        emit ShoeVerified(_productCode, authentic);
        emit ProductVerified(_productCode, msg.sender);
        emit FeeCollected(msg.sender, msg.value, "verification");
        return authentic;
    }

    function setFees(uint256 _registrationFee, uint256 _verificationFee) public onlyAdmin {
        registrationFee = _registrationFee;
        verificationFee = _verificationFee;
    }

    function getFeeStats()
        public
        view
        returns (
            uint256 totalFeesCollected,
            uint256 registrationTotal,
            uint256 verificationTotal,
            uint256 transactionCount
        )
    {
        return (
            registrationFeesCollected + verificationFeesCollected,
            registrationFeesCollected,
            verificationFeesCollected,
            totalTransactions
        );
    }

    function withdrawFees() public onlyAdmin {
        uint256 amount = address(this).balance;
        require(amount > 0, "No fees to withdraw");

        (bool success, ) = payable(admin).call{value: amount}("");
        require(success, "Fee withdrawal failed");

        emit FeesWithdrawn(admin, amount);
    }

    function getShoe(string memory _productCode) public view returns (Shoe memory) {
        require(shoeExists[_productCode], "Shoe does not exist");
        return shoes[_productCode];
    }

    function getCompanyShoes(address _companyWallet) public view returns (Shoe[] memory) {
        string[] memory codes = companyShoeCodes[_companyWallet];
        Shoe[] memory result = new Shoe[](codes.length);

        for (uint256 i = 0; i < codes.length; i++) {
            result[i] = shoes[codes[i]];
        }

        return result;
    }

    function getAllShoes() public view returns (Shoe[] memory) {
        Shoe[] memory result = new Shoe[](shoeCodes.length);

        for (uint256 i = 0; i < shoeCodes.length; i++) {
            result[i] = shoes[shoeCodes[i]];
        }

        return result;
    }

    function getAllCompanies() public view onlyAdmin returns (Company[] memory) {
        Company[] memory result = new Company[](companyWallets.length);

        for (uint256 i = 0; i < companyWallets.length; i++) {
            result[i] = companies[companyWallets[i]];
        }

        return result;
    }
}

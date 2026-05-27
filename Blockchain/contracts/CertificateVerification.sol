// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CertificateVerification {

    struct Certificate {
        uint id;
        string certificateCode;
        string studentName;
        string degree;
        bool valid;
        address issuedBy;
        address owner;
    }

    address public owner;
    uint public certificateCount;

    mapping(uint => Certificate) public certificates;
    mapping(string => uint) public certificateCodeToId;

    event CertificateIssued(
        uint certificateId,
        string certificateCode,
        string studentName
    );

    event CertificateUpdated(uint certificateId);

    event CertificateRevoked(uint certificateId);

    event OwnershipTransferred(
        uint certificateId,
        address newOwner
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier certificateExists(uint _id) {
        require(_id > 0 && _id <= certificateCount, "Certificate not found");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function issueCertificate(
        string memory _certificateCode,
        string memory _studentName,
        string memory _degree,
        address _certificateOwner
    ) public onlyOwner {

        require(
            certificateCodeToId[_certificateCode] == 0,
            "Certificate already exists"
        );

        certificateCount++;

        certificates[certificateCount] = Certificate(
            certificateCount,
            _certificateCode,
            _studentName,
            _degree,
            true,
            msg.sender,
            _certificateOwner
        );

        certificateCodeToId[_certificateCode] = certificateCount;

        emit CertificateIssued(
            certificateCount,
            _certificateCode,
            _studentName
        );
    }

    function verifyCertificate(string memory _certificateCode)
        public
        view
        returns(bool)
    {
        uint id = certificateCodeToId[_certificateCode];

        if(id == 0) {
            return false;
        }

        return certificates[id].valid;
    }

    function getCertificate(uint _id)
        public
        view
        certificateExists(_id)
        returns(
            uint,
            string memory,
            string memory,
            string memory,
            bool,
            address
        )
    {
        Certificate memory cert = certificates[_id];

        return (
            cert.id,
            cert.certificateCode,
            cert.studentName,
            cert.degree,
            cert.valid,
            cert.owner
        );
    }

    function updateCertificate(
        uint _id,
        string memory _studentName,
        string memory _degree
    )
        public
        onlyOwner
        certificateExists(_id)
    {
        Certificate storage cert = certificates[_id];

        cert.studentName = _studentName;
        cert.degree = _degree;

        emit CertificateUpdated(_id);
    }

    function revokeCertificate(uint _id)
        public
        onlyOwner
        certificateExists(_id)
    {
        certificates[_id].valid = false;

        emit CertificateRevoked(_id);
    }

    function transferCertificate(
        uint _id,
        address _newOwner
    )
        public
        certificateExists(_id)
    {
        Certificate storage cert = certificates[_id];

        require(
            msg.sender == cert.owner,
            "Not certificate owner"
        );

        cert.owner = _newOwner;

        emit OwnershipTransferred(_id, _newOwner);
    }

    function getAllCertificates()
        public
        view
        returns(Certificate[] memory)
    {
        Certificate[] memory allCertificates =
            new Certificate[](certificateCount);

        for(uint i = 0; i < certificateCount; i++) {
            allCertificates[i] = certificates[i + 1];
        }

        return allCertificates;
    }
}
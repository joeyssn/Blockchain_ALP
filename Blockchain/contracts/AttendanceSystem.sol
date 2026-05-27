// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AttendanceSystem {

    address public owner;

    uint public sessionCount;

    struct Student {
        string name;
        bool registered;
    }

    struct Session {
        string subject;
        bool active;
    }

    mapping(address => Student) public students;
    mapping(uint => Session) public sessions;
    mapping(uint => mapping(address => bool)) public attendance;

    event StudentRegistered(address student, string name);
    event SessionCreated(uint sessionId, string subject);
    event AttendanceMarked(uint sessionId, address student);
    event SessionClosed(uint sessionId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyRegisteredStudent() {
        require(students[msg.sender].registered, "Not registered");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerStudent(
        address _student,
        string memory _name
    ) public onlyOwner {

        students[_student] = Student(_name, true);

        emit StudentRegistered(_student, _name);
    }

    function createSession(
        string memory _subject
    ) public onlyOwner {

        sessionCount++;

        sessions[sessionCount] = Session(
            _subject,
            true
        );

        emit SessionCreated(sessionCount, _subject);
    }

    function closeSession(
        uint _sessionId
    ) public onlyOwner {

        sessions[_sessionId].active = false;

        emit SessionClosed(_sessionId);
    }

    function markAttendance(
        uint _sessionId
    ) public onlyRegisteredStudent {

        require(
            sessions[_sessionId].active,
            "Session closed"
        );

        require(
            !attendance[_sessionId][msg.sender],
            "Already attended"
        );

        attendance[_sessionId][msg.sender] = true;

        emit AttendanceMarked(
            _sessionId,
            msg.sender
        );
    }

    function checkAttendance(
        uint _sessionId,
        address _student
    ) public view returns(bool) {

        return attendance[_sessionId][_student];
    }

    function getStudent(
        address _student
    ) public view returns(
        string memory,
        bool
    ) {

        Student memory s = students[_student];

        return (
            s.name,
            s.registered
        );
    }

    function getSession(
        uint _sessionId
    ) public view returns(
        string memory,
        bool
    ) {

        Session memory s = sessions[_sessionId];

        return (
            s.subject,
            s.active
        );
    }
}
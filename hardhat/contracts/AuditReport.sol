// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

enum ReportStatus {
    STARTED,
    AWAITING,
    SHARED,
    COMPLETED,
    FINALIZED
  }

  struct User {
    uint256 ownedAmount;
    uint256 permissionedAmount;
  }

  struct Audit {
    address owner;
    ReportStatus status;
    uint256 index;
    string name;
    string auditIdentifier;
    address auditor;
  }

  struct PermissionedAudit {
    address owner;
    uint256 index;
  }

/**
 * @title Audit Report
 * @notice Used for creation and storage of audit reports
 */
contract AuditReport is Ownable {

    mapping(address => User) users;
    mapping(address => mapping(uint256 => Audit)) audits;
    mapping(address => mapping(uint256 => PermissionedAudit)) permissionedAudits;

    function getUser(
    address user
  ) public view returns (User memory) {
    User memory selectedUser = users[user];

    return selectedUser;
  }

    function getOwnedAudits(
    address owner
  ) public view returns (Audit[] memory) {
    User memory selectedUser = users[owner];

    uint256 amount = selectedUser.ownedAmount;
    Audit[]
      memory userAudits = new Audit[](amount);

    for (uint256 i = 0; i != amount; i++) {
      userAudits[i++] = audits[owner][i];
    }

    return userAudits;
  }

  function getPermissionedAudits(
    address owner
  ) public view returns (Audit[] memory) {
    User memory selectedUser = users[owner];

    uint256 amount = selectedUser.permissionedAmount;
    Audit[]
      memory userAudits = new Audit[](amount);

    for (uint256 i = 0; i != amount; i++) {
      PermissionedAudit memory currentAudit = permissionedAudits[owner][i];
      userAudits[i++] = audits[currentAudit.owner][currentAudit.index];
    }

    return userAudits;
  }

    function addAudit(string memory _name, string memory _auditIdentifier, address _trusted) public {
      User storage creator = users[msg.sender];
      uint256 ownedAmount = creator.ownedAmount;

      User memory auditor = users[msg.sender];
      uint256 permissionedAmount = auditor.permissionedAmount;

      audits[msg.sender][ownedAmount] = Audit(msg.sender, ReportStatus.STARTED,  ownedAmount, _name, _auditIdentifier, _trusted);
      permissionedAudits[_trusted][permissionedAmount] = PermissionedAudit(msg.sender, ownedAmount);
      permissionedAmount++;
      ownedAmount++;
    }
}
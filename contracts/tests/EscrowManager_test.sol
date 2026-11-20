// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// These two imports are provided automatically by Remix, you do not need to install anything.
import "remix_tests.sol";
import "remix_accounts.sol";
import "../contracts/EscrowManager.sol";

/**
 * @dev Remix's Solidity Unit Testing plugin can change which account calls a *test function*
 *      (using the "#sender" comment), but it cannot change the msg.sender seen by a contract
 *      that the test contract calls internally - that will always be the test contract's own
 *      address. To properly test rules like "only the client can release payment", we use small
 *      "Actor" helper contracts. Each Actor has its own address, so calling EscrowManager through
 *      a different Actor is equivalent to calling it from a different wallet.
 */
contract Actor {
    EscrowManager private target;

    constructor(EscrowManager _target) {
        target = _target;
    }

    function createEscrow(uint256 jobId, address freelancerAddress) public payable returns (uint256) {
        return target.createEscrow{value: msg.value}(jobId, freelancerAddress);
    }

    function releasePayment(uint256 escrowId) public {
        target.releasePayment(escrowId);
    }

    function raiseDispute(uint256 escrowId) public {
        target.raiseDispute(escrowId);
    }

    function resolveDispute(uint256 escrowId, bool releaseToFreelancer) public {
        target.resolveDispute(escrowId, releaseToFreelancer);
    }

    // lets this Actor contract receive ETH when it is paid out
    receive() external payable {}
}

contract EscrowManagerTest {
    EscrowManager escrowManager;
    Actor clientActor;
    Actor freelancerActor;
    Actor strangerActor;

    /// 'beforeAll' runs once before every test function below.
    /// This test contract deploys EscrowManager, so this test contract's own address
    /// becomes the "admin" of the contract under test.
    function beforeAll() public {
        escrowManager = new EscrowManager();
        clientActor = new Actor(escrowManager);
        freelancerActor = new Actor(escrowManager);
        strangerActor = new Actor(escrowManager);
    }

    /// #value: 1000000000000000000
    function createEscrowShouldSucceed() public payable {
        uint256 escrowId = clientActor.createEscrow{value: msg.value}(101, address(freelancerActor));
        Assert.equal(escrowId, uint256(1), "First escrow id should be 1");

        (
            uint256 id,
            uint256 jobId,
            address escrowClient,
            address escrowFreelancer,
            uint256 amount,
            EscrowManager.Status status
        ) = escrowManager.getEscrow(escrowId);

        Assert.equal(id, uint256(1), "Escrow id mismatch");
        Assert.equal(jobId, uint256(101), "Job id mismatch");
        Assert.equal(escrowClient, address(clientActor), "Client address mismatch");
        Assert.equal(escrowFreelancer, address(freelancerActor), "Freelancer address mismatch");
        Assert.equal(amount, uint256(1000000000000000000), "Amount mismatch");
        Assert.equal(uint256(status), uint256(EscrowManager.Status.Funded), "Status should be Funded");
    }

    function createEscrowShouldFailWithZeroValue() public {
        bool reverted = false;
        try clientActor.createEscrow(102, address(freelancerActor)) {
        } catch {
            reverted = true;
        }
        Assert.ok(reverted, "createEscrow should revert when value is zero");
    }

    /// #value: 1000000000000000000
    function createEscrowShouldFailWithZeroAddressFreelancer() public payable {
        bool reverted = false;
        try clientActor.createEscrow{value: msg.value}(103, address(0)) {
        } catch {
            reverted = true;
        }
        Assert.ok(reverted, "createEscrow should revert when freelancer is the zero address");
    }

    function releaseShouldFailWhenCalledByFreelancer() public {
        bool reverted = false;
        try freelancerActor.releasePayment(1) {
        } catch {
            reverted = true;
        }
        Assert.ok(reverted, "Only the client should be able to release payment");
    }

    function releaseShouldFailWhenCalledByStranger() public {
        bool reverted = false;
        try strangerActor.releasePayment(1) {
        } catch {
            reverted = true;
        }
        Assert.ok(reverted, "A stranger should not be able to release payment");
    }

    function releaseShouldSucceedWhenCalledByClient() public {
        clientActor.releasePayment(1);
        (, , , , , EscrowManager.Status status) = escrowManager.getEscrow(1);
        Assert.equal(uint256(status), uint256(EscrowManager.Status.Released), "Status should be Released");
    }

    function releaseShouldFailWhenAlreadyReleased() public {
        bool reverted = false;
        try clientActor.releasePayment(1) {
        } catch {
            reverted = true;
        }
        Assert.ok(reverted, "Cannot release an escrow that was already released");
    }

    /// #value: 1000000000000000000
    function createSecondEscrowForDisputeTest() public payable {
        uint256 escrowId = clientActor.createEscrow{value: msg.value}(104, address(freelancerActor));
        Assert.equal(escrowId, uint256(2), "Second escrow id should be 2");
    }

    function raiseDisputeShouldSucceedForFreelancer() public {
        freelancerActor.raiseDispute(2);
        (, , , , , EscrowManager.Status status) = escrowManager.getEscrow(2);
        Assert.equal(uint256(status), uint256(EscrowManager.Status.Disputed), "Status should be Disputed");
    }

    function resolveDisputeShouldFailForNonAdmin() public {
        bool reverted = false;
        try clientActor.resolveDispute(2, true) {
        } catch {
            reverted = true;
        }
        Assert.ok(reverted, "Only the admin should be able to resolve a dispute");
    }

    function resolveDisputeShouldSucceedForAdmin() public {
        // This test contract deployed EscrowManager in beforeAll, so it is the admin,
        // meaning we can call resolveDispute directly here without going through an Actor.
        escrowManager.resolveDispute(2, false);
        (, , , , , EscrowManager.Status status) = escrowManager.getEscrow(2);
        Assert.equal(uint256(status), uint256(EscrowManager.Status.Refunded), "Status should be Refunded");
    }
}

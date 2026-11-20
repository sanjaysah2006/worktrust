// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title WorkTrust EscrowManager
 * @notice Holds Sepolia test ETH for WorkTrust jobs until the client approves the work,
 *         and manages disputes between clients and freelancers.
 * @dev One contract manages every escrow. Each job gets its own escrow record identified
 *      by an incrementing escrowId. Deployed and tested using Remix IDE.
 *
 *      Deployed address (Sepolia): 0xC3B5530C51AD7D50D52f855dE14dA2684F2d38d5
 */
contract EscrowManager {
    // ------------------------------------------------------------------
    // Types
    // ------------------------------------------------------------------

    enum Status {
        Funded,     // 0 - client has deposited money, work is in progress
        Released,   // 1 - money has been paid out to the freelancer
        Disputed,   // 2 - client or freelancer flagged a problem
        Refunded    // 3 - money has been sent back to the client
    }

    struct Escrow {
        uint256 id;
        uint256 jobId;              // the id of the job in the WorkTrust database (Supabase)
        address payable client;
        address payable freelancer;
        uint256 amount;             // amount deposited, in wei
        Status status;
    }

    // ------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------

    address public admin;
    uint256 public escrowCount;
    mapping(uint256 => Escrow) private escrows;

    // simple reentrancy lock, does not need any external library
    bool private locked;

    // ------------------------------------------------------------------
    // Events
    // ------------------------------------------------------------------

    event EscrowCreated(
        uint256 indexed escrowId,
        uint256 indexed jobId,
        address indexed client,
        address freelancer,
        uint256 amount
    );

    event PaymentReleased(uint256 indexed escrowId, address indexed freelancer, uint256 amount);

    event DisputeRaised(uint256 indexed escrowId, address indexed raisedBy);

    event DisputeResolved(uint256 indexed escrowId, bool releasedToFreelancer, address indexed resolvedBy);

    // ------------------------------------------------------------------
    // Modifiers
    // ------------------------------------------------------------------

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier escrowExists(uint256 escrowId) {
        require(escrowId > 0 && escrowId <= escrowCount, "Escrow does not exist");
        _;
    }

    modifier nonReentrant() {
        require(!locked, "Reentrant call blocked");
        locked = true;
        _;
        locked = false;
    }

    // ------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------

    /// @notice Whoever deploys the contract becomes the WorkTrust administrator.
    constructor() {
        admin = msg.sender;
    }

    // ------------------------------------------------------------------
    // Core functions
    // ------------------------------------------------------------------

    /**
     * @notice Client calls this to hire a freelancer and lock funds in escrow.
     * @param jobId The id of the job in the WorkTrust database.
     * @param freelancerAddress The wallet address of the hired freelancer.
     * @return escrowId The id of the newly created escrow.
     */
    function createEscrow(uint256 jobId, address freelancerAddress)
        external
        payable
        nonReentrant
        returns (uint256 escrowId)
    {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        require(freelancerAddress != address(0), "Freelancer address cannot be zero");
        require(freelancerAddress != msg.sender, "Client and freelancer cannot be the same address");

        escrowCount += 1;
        escrowId = escrowCount;

        escrows[escrowId] = Escrow({
            id: escrowId,
            jobId: jobId,
            client: payable(msg.sender),
            freelancer: payable(freelancerAddress),
            amount: msg.value,
            status: Status.Funded
        });

        emit EscrowCreated(escrowId, jobId, msg.sender, freelancerAddress, msg.value);
    }

    /**
     * @notice Client calls this after approving the freelancer's submitted work.
     *         Sends the deposited amount to the freelancer.
     * @param escrowId The escrow to release.
     */
    function releasePayment(uint256 escrowId) external nonReentrant escrowExists(escrowId) {
        Escrow storage escrow = escrows[escrowId];

        require(msg.sender == escrow.client, "Only the client can release this payment");
        require(escrow.status == Status.Funded, "Escrow is not in a releasable state");

        // effects first
        escrow.status = Status.Released;
        uint256 amountToSend = escrow.amount;

        // interaction last
        (bool success, ) = escrow.freelancer.call{value: amountToSend}("");
        require(success, "Transfer to freelancer failed");

        emit PaymentReleased(escrowId, escrow.freelancer, amountToSend);
    }

    /**
     * @notice Client or freelancer calls this if something is wrong with the job.
     * @param escrowId The escrow to dispute.
     */
    function raiseDispute(uint256 escrowId) external escrowExists(escrowId) {
        Escrow storage escrow = escrows[escrowId];

        require(
            msg.sender == escrow.client || msg.sender == escrow.freelancer,
            "Only the client or freelancer can raise a dispute"
        );
        require(escrow.status == Status.Funded, "Only a funded escrow can be disputed");

        escrow.status = Status.Disputed;

        emit DisputeRaised(escrowId, msg.sender);
    }

    /**
     * @notice Administrator calls this to settle a dispute, sending funds to whichever
     *         side is judged to be correct.
     * @param escrowId The disputed escrow.
     * @param releaseToFreelancer True sends funds to the freelancer, false refunds the client.
     */
    function resolveDispute(uint256 escrowId, bool releaseToFreelancer)
        external
        nonReentrant
        onlyAdmin
        escrowExists(escrowId)
    {
        Escrow storage escrow = escrows[escrowId];

        require(escrow.status == Status.Disputed, "Escrow is not under dispute");

        uint256 amountToSend = escrow.amount;
        address payable recipient;

        // effects first
        if (releaseToFreelancer) {
            escrow.status = Status.Released;
            recipient = escrow.freelancer;
        } else {
            escrow.status = Status.Refunded;
            recipient = escrow.client;
        }

        // interaction last
        (bool success, ) = recipient.call{value: amountToSend}("");
        require(success, "Transfer failed");

        emit DisputeResolved(escrowId, releaseToFreelancer, msg.sender);
    }

    /**
     * @notice Read the details of any escrow. Anyone can call this, it only reads data.
     */
    function getEscrow(uint256 escrowId)
        external
        view
        escrowExists(escrowId)
        returns (
            uint256 id,
            uint256 jobId,
            address client,
            address freelancer,
            uint256 amount,
            Status status
        )
    {
        Escrow storage escrow = escrows[escrowId];
        return (escrow.id, escrow.jobId, escrow.client, escrow.freelancer, escrow.amount, escrow.status);
    }

    // ------------------------------------------------------------------
    // Guard against unexpected direct ETH transfers
    // ------------------------------------------------------------------

    receive() external payable {
        revert("Direct ETH transfers are not allowed, use createEscrow");
    }

    fallback() external payable {
        revert("Function does not exist");
    }
}

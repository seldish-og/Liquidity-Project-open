// SPDX-License-Identifier: MIT

// File: @openzeppelin/contracts@4.9.3/utils/Context.sol

// OpenZeppelin Contracts v4.4.1 (utils/Context.sol)

pragma solidity ^0.8.0;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

// File: @openzeppelin/contracts@4.9.3/access/Ownable.sol

// OpenZeppelin Contracts (last updated v4.9.0) (access/Ownable.sol)

pragma solidity ^0.8.0;

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

// File: liquidity.sol

pragma solidity ^0.8.0;

interface ILiquidityLocker {
    function transferLockOwnership(
        address _lpToken,
        uint256 _index,
        uint256 _lockID,
        address payable _newOwner
    ) external;

    function getUserLockForTokenAtIndex(
        address _user,
        address _lpToken,
        uint256 _index
    )
        external
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            address
        );
}

contract LiquidityMarketplace is Ownable {
    ILiquidityLocker public liquidityLocker;

    struct Deal {
        address borrower;
        address lpToken;
        uint256 lockIndex;
        uint256 dealAmount;
        uint256 interestRate;
        uint256 loanDuration;
        uint256 startTime;
        address lender;
        bool isRepaid;
        bool isActive;
    }

    struct Auction {
        address owner;
        address highestBidOwner;
        address lpToken;
        uint256 lockIndex;
        uint256 startPrice;
        uint256 imeddiatelySellPrice;
        uint256 bidStep;
        uint256 duration;
        uint256 startTime;
        bool isActive;
        bool isFinished;
        bool immediatelySell;
    }

    mapping(address => uint256[]) private userDeals;
    mapping(address => uint256[]) private userAuction;

    mapping(uint256 => mapping(address => uint256)) bids;
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => Deal) public deals;
    uint256 public nextAuctionId;
    uint256 public nextDealId;

    // События
    event DealInitialized(
        uint256 indexed dealId,
        address indexed borrower,
        address lpToken,
        uint256 lockIndex,
        uint256 dealAmount,
        uint256 interestRate,
        uint256 loanDuration
    );
    event DealActivated(uint256 indexed dealId, address indexed activator);
    event DealMade(uint256 indexed dealId, address indexed lender);
    event LoanRepaid(uint256 indexed dealId, address indexed repayer);
    event CollateralClaimed(uint256 indexed dealId, address indexed claimer);
    event AuctionStarted(
        uint256 indexed auctionId,
        address indexed owner,
        address lpToken,
        uint256 lockIndex,
        uint256 startPrice,
        uint256 imeddiatelySellPrice,
        uint256 bidStep,
        uint256 duration,
        bool immediatelySell
    );
    event AuctionActivated(
        uint256 indexed auctionId,
        address indexed activator
    );
    event BidMade(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount,
        uint256 timestamp
    );
    event AuctionWon(uint256 indexed auctionId, address indexed winner);
    event AuctionRewardClaimed(
        uint256 indexed auctionId,
        address indexed owner,
        uint256 amount,
        uint256 timestamp
    );
    event BidWithdrawn(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount,
        uint256 timestamp
    );
    event ImmediatelyBought(
        uint256 indexed auctionId,
        uint256 amount,
        uint256 timestamp
    );

    constructor(ILiquidityLocker _liquidityLocker) {
        liquidityLocker = _liquidityLocker;
    }

    function checkLiquidityOwner(
        address expectedOwner,
        address lpToken,
        uint256 index
    ) public view returns (bool) {
        (, , , , , address owner) = liquidityLocker.getUserLockForTokenAtIndex(
            expectedOwner,
            lpToken,
            index
        );
        return owner == expectedOwner;
    }

    function getUserDeals(address _address)
        external
        view
        returns (uint256[] memory)
    {
        return userDeals[_address];
    }

    function getUserAuction(address _address)
        external
        view
        returns (uint256[] memory)
    {
        return userAuction[_address];
    }

    function initializeDeal(
        address lpToken,
        uint256 lockIndex,
        uint256 dealAmount,
        uint256 interestRate,
        uint256 loanDuration
    ) public {
        require(loanDuration > 0, "Loan duration must be greater than 0");
        require(
            checkLiquidityOwner(msg.sender, lpToken, lockIndex),
            "User does not owner of this lock"
        );

        deals[nextDealId] = Deal({
            borrower: msg.sender,
            lpToken: lpToken,
            lockIndex: lockIndex,
            dealAmount: dealAmount,
            interestRate: interestRate,
            loanDuration: loanDuration,
            startTime: 0,
            lender: address(0),
            isRepaid: false,
            isActive: false
        });

        emit DealInitialized(
            nextDealId,
            msg.sender,
            lpToken,
            lockIndex,
            dealAmount,
            interestRate,
            loanDuration
        );

        userDeals[msg.sender].push(nextDealId);

        nextDealId++;
    }

    function activateDeal(uint256 dealId) external {
        Deal storage deal = deals[dealId];
        require(deal.borrower != address(0), "Deal is empty");
        require(
            checkLiquidityOwner(address(this), deal.lpToken, deal.lockIndex),
            "Contract does not owner of this liquidity"
        );
        deal.isActive = true;
        emit DealActivated(dealId, msg.sender);
    }

    function makeDeal(uint256 dealId) external payable {
        Deal storage deal = deals[dealId];
        require(deal.isActive, "Deal inactive");
        require(deal.lender == address(0), "Deal already has a lender");
        require(deal.borrower != msg.sender, "Borrower cannot make loan for himself");
        require(msg.value >= deal.dealAmount, "Insufficient funds");

        deal.lender = msg.sender;
        deal.startTime = block.timestamp;

        (bool sent, ) = payable(deal.borrower).call{value: msg.value}("");
        require(sent, "Failed to send funds");

        emit DealMade(dealId, msg.sender);
    }

    function cancelDeal(uint256 dealId) public {
        Deal storage deal = deals[dealId];
        require(deal.borrower == msg.sender, "Caller not lock owner");
        require(deal.lender == address(0), "Cannot cancel processing deal");
        (, , , , uint256 lockId, ) = liquidityLocker.getUserLockForTokenAtIndex(
            address(this),
            deal.lpToken,
            deal.lockIndex
        );
        liquidityLocker.transferLockOwnership(
            deal.lpToken,
            deal.lockIndex,
            lockId,
            payable(msg.sender)
        );
        delete deals[dealId];
    }

    function repayLoan(uint256 dealId) public payable {
        Deal storage deal = deals[dealId];
        uint256 repayAmount = deal.dealAmount + (deal.dealAmount * deal.interestRate) / 10000;
        require(!deal.isRepaid, "Deal already repaid");
        require(msg.sender == deal.borrower, "Sender is not a borrower");
        require(msg.value >= repayAmount, "Insuffitient payable amount");
        require(
            deal.startTime + deal.loanDuration > block.timestamp,
            "Loan duration exceed"
        );
        deal.isRepaid = true;
        (, , , , uint256 lockId, ) = liquidityLocker.getUserLockForTokenAtIndex(
            address(this),
            deal.lpToken,
            deal.lockIndex
        );
        liquidityLocker.transferLockOwnership(
            deal.lpToken,
            deal.lockIndex,
            lockId,
            payable(msg.sender)
        );
        (bool sent, ) = payable(deal.lender).call{value: msg.value}("");
        require(sent, "Repay failed");
        emit LoanRepaid(dealId, msg.sender);
    }

    function claimCollateral(uint256 dealId) public {
        Deal storage deal = deals[dealId];
        require(deal.lender == msg.sender, "Caller is not lender");
        require(
            deal.startTime + deal.loanDuration < block.timestamp,
            "Deal is active yet"
        );
        (, , , , uint256 lockId, ) = liquidityLocker.getUserLockForTokenAtIndex(
            address(this),
            deal.lpToken,
            deal.lockIndex
        );
        liquidityLocker.transferLockOwnership(
            deal.lpToken,
            deal.lockIndex,
            lockId,
            payable(msg.sender)
        );
        emit CollateralClaimed(dealId, msg.sender);
    }

    function startAuction(
        address lpToken,
        uint256 lockIndex,
        uint256 startPrice,
        uint256 imeddiatelySellPrice,
        uint256 bidStep,
        uint256 duration,
        bool immediatelySell
    ) public {
        require(duration > 0, "Duration must be greater than 0");
        require(
            checkLiquidityOwner(msg.sender, lpToken, lockIndex),
            "User does not owner of this lock"
        );
        require(imeddiatelySellPrice > 0, "imeddiatelySellPrice must be positive number");

        auctions[nextAuctionId] = Auction({
            owner: msg.sender,
            highestBidOwner: address(0),
            lpToken: lpToken,
            lockIndex: lockIndex,
            startPrice: startPrice,
            imeddiatelySellPrice: imeddiatelySellPrice,
            bidStep: bidStep,
            duration: duration,
            startTime: block.timestamp,
            isActive: false,
            isFinished: false,
            immediatelySell: immediatelySell
        });
        emit AuctionStarted(
            nextAuctionId,
            msg.sender,
            lpToken,
            lockIndex,
            startPrice,
            imeddiatelySellPrice,
            bidStep,
            duration,
            immediatelySell
        );

        userAuction[msg.sender].push(nextAuctionId);

        nextAuctionId++;
    }

    function activateAuction(uint256 auctionId) external {
        Auction storage auction = auctions[auctionId];
        require(!auction.isActive, "Auction already active");
        require(auction.owner != address(0), "Auction is empty");
        require(
            checkLiquidityOwner(
                address(this),
                auction.lpToken,
                auction.lockIndex
            ),
            "Contract does not owner of this liquidity"
        );
        auction.isActive = true;
        auction.startTime = block.timestamp;
        emit AuctionActivated(auctionId, msg.sender);
    }

    function immediatelyBuy(uint256 auctionId) external payable {
        Auction storage auction = auctions[auctionId];
        require(auction.immediatelySell, "Immediately selling is disabled for this lottery");
        require(auction.owner != msg.sender, "Sender is auction owner");
        require(msg.value >= auction.imeddiatelySellPrice, "Insuffitient payable amount");
        require(
            !auction.isFinished && auction.isActive &&
                auction.startTime + auction.duration > block.timestamp,
            "Auction inactive"
        );
        auction.isFinished = true;
        (, , , , uint256 lockId, ) = liquidityLocker.getUserLockForTokenAtIndex(
            address(this),
            auction.lpToken,
            auction.lockIndex
        );
        liquidityLocker.transferLockOwnership(
            auction.lpToken,
            auction.lockIndex,
            lockId,
            payable(msg.sender)
        );
        (bool sent, ) = payable(auction.owner).call{value: msg.value}("");
        require(sent, "Failed to send funds");
        emit ImmediatelyBought(auctionId, msg.value, block.timestamp);
    }

    function makeBid(uint256 auctionId) public payable {
        Auction storage auction = auctions[auctionId];
        require(
            !auction.isFinished && auction.isActive &&
                auction.startTime + auction.duration > block.timestamp,
            "Auction inactive"
        );
        require(auction.owner != msg.sender, "Sender is auction owner");
        require(
            bids[auctionId][msg.sender] + msg.value >
                bids[auctionId][auction.highestBidOwner] + auction.bidStep,
            "Bid must be greater than previous + bidStep"
        );
        bids[auctionId][msg.sender] += msg.value;
        auction.highestBidOwner = msg.sender;
        emit BidMade(auctionId, msg.sender, msg.value, block.timestamp);
    }

    function withdrawAuctionLiquidity(uint256 auctionId) public {
        Auction storage auction = auctions[auctionId];
        require(
            auction.startTime + auction.duration < block.timestamp,
            "Auction is active yet"
        );
        require(auction.highestBidOwner == address(0), "Not claimable");
        require(msg.sender == auction.owner, "Caller is not auction owner");

        (, , , , uint256 lockId, ) = liquidityLocker.getUserLockForTokenAtIndex(
            address(this),
            auction.lpToken,
            auction.lockIndex
        );
        liquidityLocker.transferLockOwnership(
            auction.lpToken,
            auction.lockIndex,
            lockId,
            payable(msg.sender)
        );
    }

    function claimAuction(uint256 auctionId) public {
        Auction memory auction = auctions[auctionId];
        require(
            auction.startTime + auction.duration < block.timestamp,
            "Auction is active yet"
        );
        require(
            msg.sender == auction.highestBidOwner,
            "Not eligible for claim"
        );
        (, , , , uint256 lockId, ) = liquidityLocker.getUserLockForTokenAtIndex(
            address(this),
            auction.lpToken,
            auction.lockIndex
        );
        liquidityLocker.transferLockOwnership(
            auction.lpToken,
            auction.lockIndex,
            lockId,
            payable(msg.sender)
        );
        emit AuctionWon(auctionId, msg.sender);
    }

    function claimAuctionReward(uint256 auctionId) external {
        Auction memory auction = auctions[auctionId];
        require(
            auction.startTime + auction.duration < block.timestamp,
            "Auction active yet"
        );
        require(msg.sender == auction.owner, "Not eligible for claim");
        uint256 bidAmount = bids[auctionId][auction.highestBidOwner];
        (bool sent, ) = payable(msg.sender).call{value: bidAmount}("");
        require(sent, "Withdraw failed");
        emit AuctionRewardClaimed(
            auctionId,
            msg.sender,
            bidAmount,
            block.timestamp
        );
    }

    function withdrawBid(uint256 auctionId) external {
        Auction storage auction = auctions[auctionId];
        require(
            auction.startTime + auction.duration < block.timestamp,
            "Auction active yet"
        );
        uint256 bidAmount = bids[auctionId][msg.sender];
        require(
            msg.sender != auction.highestBidOwner && bidAmount > 0,
            "No eligible to withdraw"
        );
        (bool sent, ) = payable(msg.sender).call{value: bidAmount}("");
        require(sent, "Withdraw failed");
        emit BidWithdrawn(auctionId, msg.sender, bidAmount, block.timestamp);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {LSP8IdentifiableDigitalAsset} from "@lukso/lsp8-contracts/contracts/LSP8IdentifiableDigitalAsset.sol";
import {_LSP4_TOKEN_TYPE_TOKEN, _LSP4_TOKEN_TYPE_COLLECTION, _LSP4_METADATA_KEY} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {ILSP7DigitalAsset as ILSP7} from "@lukso/lsp7-contracts/contracts/ILSP7DigitalAsset.sol";
import {ILSP8IdentifiableDigitalAsset as ILSP8} from "@lukso/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol";
import {ILSP26FollowerSystem as IFollowerSystem} from "@lukso/lsp26-contracts/contracts/ILSP26FollowerSystem.sol";
import {ILSP7Burnable} from "./ILSP7Burnable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./Counters.sol";
import "./Event.sol";
import "./Error.sol";

/**
 * @title LukSeals NFT Collection
 * @author Aratta Labs
 * @notice An LSP8 NFT collection on LUKSO with a configurable multi-phase minting system.
 * @dev Implements the `LSP8IdentifiableDigitalAsset` standard.
 * @custom:version 1.0.0
 * @custom:emoji 🦭
 * @custom:security-contact atenyun@gmail.com
 */
contract LukSeals is LSP8IdentifiableDigitalAsset("LukSeals", "SEAL", msg.sender, _LSP4_TOKEN_TYPE_COLLECTION, _LSP4_TOKEN_TYPE_TOKEN), Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // STATE VARIABLES

    // Public constant variables
    bytes public constant VERSION = "1.0.0";
    uint256 public constant MAX_SUPPLY = 2222;
    uint32 public constant PHASE_ONE_TWO_SUPPLY_CAP = 222;
    address public FISH;
    address public MEMBER_CARD;
    address public RICH;
    address public FISHCAN;
    address public ARATTALABS;
    address public LUKSEALS;
    address public MADSKI;
    address public DACHRIZ;
    address public ARFI;
    address public FOLLOWING;

    // Public state variables
    Counters.Counter public tokenIdCounter;
    bytes32 public activePhase;
    bool public initialized;
    uint256 public PPT = 500; // Point per tap

    // Mappings and interfaces

    // Define a struct to hold all related addresses.
    struct ContractAddresses {
        address fish;
        address memberCard;
        address rich;
        address fishcan;
        address arattalabs;
        address lukseals;
        address madski;
        address dachriz;
        address arfi;
        address following;
    }

    struct PhaseData {
        string background;
        uint256 maxMintPerWallet;
        uint256 price;
        address tokenAddress;
    }

    struct LevelData {
        uint256 xp;
        uint8 level;
    }

    struct WhitelistData {
        address userAddress;
        uint8 count;
    }

    mapping(bytes32 => PhaseData) public phases; // PhaseName => PhaseData
    mapping(address => uint256) public lastTap; // user => timestamp
    mapping(bytes32 => LevelData) public level; // tokenId => level & xp
    mapping(uint8 => uint256) public levelPrice; // => 1=2 ether , 2= 4ether
    mapping(address => mapping(bytes32 => uint8)) public mintCount; // address => phase => counter
    mapping(address => uint8) public whitelist;

    ILSP7 private immutable fishContract;
    ILSP8 private immutable memberCardContract;
    ILSP8 private immutable richContract;
    ILSP8 private immutable fishCanContract;
    IFollowerSystem private immutable fSys;

    /**
     * @notice Initializes the contract with a set of default addresses.
     * @param _defaultAddresses A struct containing the initial addresses for all associated contracts.
     * @dev This constructor sets all critical external contract addresses upon deployment.
     */
    constructor(ContractAddresses memory _defaultAddresses, address[] memory _whitelistedAddrs) {
        // The `_defaultAddresses` struct is passed to the `updateAddresses` function.
        // This allows for a clean and efficient initialization of all addresses at once.
        updateAddresses(_defaultAddresses);

        fishContract = ILSP7(_defaultAddresses.fish);
        memberCardContract = ILSP8(_defaultAddresses.memberCard);
        richContract = ILSP8(_defaultAddresses.rich);
        fishCanContract = ILSP8(_defaultAddresses.fishcan);
        fSys = IFollowerSystem(_defaultAddresses.following);

        updateWhitelist(_whitelistedAddrs, 1);
    }

    /**
     * @notice Initializes the minting phases and sets the initial active phase.
     * @dev This function is a common pattern for upgradeable contracts, allowing for a two-step
     * deployment process (deploy contract, then initialize). It can only be called once by the owner.
     */
    function initialize() public onlyOwner {
        // Ensure this function can only be called one time.
        require(!initialized, "Already initialized");

        // Define the properties for each minting phase.
        // PhaseData: (background, maxMintPerWallet, price, tokenAddress)
        // address(0) is used to denote payment with the native blockchain token (LYX).
        phases[keccak256(bytes("phase1"))] = PhaseData("rare", 2, 100_000 ether, FISH);
        phases[keccak256(bytes("phase2"))] = PhaseData("rare", 2, 100_000 ether, FISH);
        phases[keccak256(bytes("phase3"))] = PhaseData("normal", 100, 8 ether, address(0));
        phases[keccak256(bytes("phase4"))] = PhaseData("normal", 1000, 10 ether, address(0));

        activePhase = keccak256(bytes("phase1"));

        // Set the level prices
        levelPrice[1] = 2_000;
        levelPrice[2] = 2_500;
        levelPrice[3] = 3_500;
        levelPrice[4] = 4_000;
        levelPrice[5] = 5_000;
        levelPrice[6] = 5_000;
        levelPrice[7] = 25_000;
        levelPrice[8] = 25_000;
        levelPrice[9] = 50_000;
        levelPrice[10] = 100_000;

        // Set the initialized flag to prevent subsequent calls.
        initialized = true;
    }

    /**
     * @notice Updates the properties of an existing minting phase.
     * @dev This function can only be called by the contract owner. It ensures the phase being updated is valid before modifying its properties.
     * @param _phaseName The name of the phase to be updated. Allowed phases are (phase1, phase2, phase3, and phase4).
     * @param _background The new background trait for NFTs minted in this phase.
     * @param _maxMintPerWallet The new maximum number of NFTs a single wallet can mint in this phase.
     * @param _price The new price for minting one NFT.
     * @param _tokenAddress The new payment token address (0x0 for native token).
     */
    function updatePhase(
        bytes32 _phaseName,
        string memory _background,
        uint256 _maxMintPerWallet,
        uint256 _price,
        address _tokenAddress
    ) public onlyOwner {
        phases[_phaseName] = PhaseData(_background, _maxMintPerWallet, _price, _tokenAddress);

        // Emit an event to signal that the phase has been updated.
        emit PhaseUpdated(_phaseName, _background, _maxMintPerWallet, _price, _tokenAddress);
    }

    // update the boost manually by owner
    function updatePoint(
        bytes32 _tokenId,
        uint256 _point,
        uint8 _level
    ) public onlyOwner {
        LevelData memory levelData = level[_tokenId];
        levelData.xp += _point;
        levelData.level = _level;

        level[_tokenId] = levelData;

        emit LevelUpdated(_tokenId, _point, _level);
    }

    function updatePPT(uint256 _newValue) public onlyOwner {
        PPT = _newValue;

        // Emit an event to signal that the PPT has been updated.
        emit PPTUpdated(_newValue);
    }

    /**
     * @notice Updates all core contract addresses at once.
     * @dev This function is restricted to the contract owner. Using a struct improves
     * clarity and reduces the risk of misordering parameters.
     * @param _newAddresses A struct containing the new addresses for all associated contracts.
     */
    function updateAddresses(ContractAddresses memory _newAddresses) public onlyOwner {
        // Update each contract address from the provided struct.
        FISH = _newAddresses.fish;
        MEMBER_CARD = _newAddresses.memberCard;
        RICH = _newAddresses.rich;
        FISHCAN = _newAddresses.fishcan;
        ARATTALABS = _newAddresses.arattalabs;
        LUKSEALS = _newAddresses.lukseals;
        MADSKI = _newAddresses.madski;
        DACHRIZ = _newAddresses.dachriz;
        ARFI = _newAddresses.arfi;
        FOLLOWING = _newAddresses.following;

        // Emit an event to signal that the addresses have been updated, including all new values for traceability.
        emit AddressesUpdated(
            _newAddresses.fish,
            _newAddresses.memberCard,
            _newAddresses.rich,
            _newAddresses.fishcan,
            _newAddresses.arattalabs,
            _newAddresses.lukseals,
            _newAddresses.madski,
            _newAddresses.dachriz,
            _newAddresses.arfi,
            _newAddresses.following
        );
    }

    /**
     * @notice Updates the whitelist counts for multiple addresses at once.
     * @dev This function can only be called by the contract owner. It iterates through
     * the provided arrays to add or update addresses on the whitelist.
     * @param _addrs An array of addresses to be added or updated on the whitelist.
     * A value of 0 in `_counts` will remove the corresponding address from the whitelist.
     */
    function updateWhitelist(address[] memory _addrs, uint8 _count) public onlyOwner {
        // Loop through each address and its corresponding count.
        for (uint256 i = 0; i < _addrs.length; i++) {
            address addr = _addrs[i];
            uint8 count = _count;

            // Ensure the address being updated is not the zero address.
            require(addr != address(0), Errors.InvalidAddress());

            // Update the whitelist mapping with the new count.
            whitelist[addr] = count;

            // Emit an event for each updated address for transparency.
            emit WhitelistUpdated(addr, count);
        }
    }

    /**
     * @dev Updates the active phase, but only if the provided phase name is one of the valid phases.
     * @param _phaseName The new phase to set.
     */
    function updateActivePhase(bytes32 _phaseName) public onlyOwner {
        activePhase = _phaseName;
    }

    // a function to tap
    // every 24 hours
    function tapIt(bytes32 _tokenId) public {
        // Formula: total XP * tapPoint = VFISH

        // Check if passed 24 hours of last tap
        require (lastTap[_msgSender()] + 24 hours < block.timestamp, Errors.CooldownPeriodNotPassed()) ;

        uint256 tapPoint = 0;

        if (memberCardContract.balanceOf(_msgSender()) > 0) tapPoint += PPT * 8; // memberCard
        if (richContract.balanceOf(_msgSender()) > 0) tapPoint += PPT * 3; // richFish
        if (fishCanContract.balanceOf(_msgSender()) > 0) tapPoint += PPT * 3; // fishCan

        if (fishContract.balanceOf(_msgSender()) > 1_000_000 ether) tapPoint += PPT * 2; // 1mFish
        if (fishContract.balanceOf(_msgSender()) > 3_000_000 ether) tapPoint += PPT * 3; // 3mFish
        if (fishContract.balanceOf(_msgSender()) > 5_000_000 ether) tapPoint += PPT * 5; // 5mFish
        if (fishContract.balanceOf(_msgSender()) > 7_000_000 ether) tapPoint += PPT * 7; // 7mFish
        if (fishContract.balanceOf(_msgSender()) > 10_000_000 ether) tapPoint += PPT * 10; // 10mFish

        if (fSys.isFollowing(_msgSender(), LUKSEALS)) tapPoint += PPT * 2; // followLukSeals
        if (fSys.isFollowing(_msgSender(), MADSKI)) tapPoint += PPT * 2; // followMadski
        if (fSys.isFollowing(_msgSender(), ARATTALABS)) tapPoint += PPT * 1; // followArattaLabs
        if (fSys.isFollowing(_msgSender(), DACHRIZ)) tapPoint += PPT * 1; // followDachriz
        if (fSys.isFollowing(_msgSender(), ARFI)) tapPoint += PPT * 1; // followARF-I

        if (fSys.isFollowing(LUKSEALS, _msgSender())) tapPoint += PPT * 2; // beFollowedByLukSeals
        if (fSys.isFollowing(MADSKI, _msgSender())) tapPoint += PPT * 2; // beFollowedByArattaLabs
        if (fSys.isFollowing(ARFI, _msgSender())) tapPoint += PPT * 4; // beFollowedByARF-I
        if (fSys.isFollowing(MADSKI, _msgSender())) tapPoint += PPT * 1; // beFollowedByMadski

        if (balanceOf(_msgSender()) >= 3) tapPoint += PPT * 2; // have3seals
        if (balanceOf(_msgSender()) >= 5) tapPoint += PPT * 2; // have5seals
        if (balanceOf(_msgSender()) >= 10) tapPoint += PPT * 3; // have10seals
        if (balanceOf(_msgSender()) >= 15) tapPoint += PPT * 3; // have15seals
        if (balanceOf(_msgSender()) >= 20) tapPoint += PPT * 5; // have20seals
        if (balanceOf(_msgSender()) >= 50) tapPoint += PPT * 10; // have50seals

        LevelData memory levelData = level[_tokenId];
        levelData.xp += tapPoint;

         level[_tokenId] = levelData;

        lastTap[_msgSender()] = block.timestamp;
    }

    /**
     * @notice Allows a user to level up a specific token if they meet the requirements.
     * @dev The function checks for a maximum level, requires sufficient XP,
     * and transfers the XP cost to the contract.
     * @param _tokenId The unique identifier of the token to be leveled up.
     * @param _metadata The updated metadata to be associated with the token.
     */
    function levelUp(bytes32 _tokenId, bytes memory _metadata) public {
        // Get the current level data from storage for efficiency.
        LevelData storage currentLevelData = level[_tokenId];
        uint8 nextLevelNumber = currentLevelData.level + 1;

        // Ensure the token's new level does not exceed the maximum (e.g., 10).
        require(nextLevelNumber <= 10, Errors.MaxLevelReached());

        // Get the XP cost for the next level from a mapping.
        uint256 costToLevelUp = levelPrice[nextLevelNumber];

        // Verify the user has enough accumulated XP to pay the cost.
        require(currentLevelData.xp >= costToLevelUp, Errors.NotEnoughXP(currentLevelData.xp, costToLevelUp));

        // Transfer the required XP from the user to this contract.
        // This is a standard LSP7 token transfer.
        ILSP7(FISH).transfer(_msgSender(), address(this), costToLevelUp, true, "");

        // Update the token's metadata with the new information.
        _setDataForTokenId(_tokenId, _LSP4_METADATA_KEY, _metadata);

        // Deduct the XP cost and increment the level.
        currentLevelData.xp -= costToLevelUp;
        currentLevelData.level = nextLevelNumber;
    }

    /**
     * @notice Allows a user to level down a specific token.
     * @dev This function decrements the level but keeps the current XP.
     * @param _tokenId The unique identifier of the token to be leveled down.
     * @param _metadata The updated metadata to be associated with the token.
     */
    function levelDown(bytes32 _tokenId, bytes memory _metadata) public {
        // Get the current level data from storage.
        LevelData storage currentLevelData = level[_tokenId];
        uint8 prevLevelNumber = currentLevelData.level - 1;

        // Ensure the token's level doesn't go below the minimum (e.g., 1).
        require(currentLevelData.level > 1, Errors.AlreadyAtMinLevel());

        // Update the token's metadata.
        _setDataForTokenId(_tokenId, _LSP4_METADATA_KEY, _metadata);

        // Decrement the level. The XP remains unchanged.
        currentLevelData.level = prevLevelNumber;
    }

    //You can let ARF-I level your seal character daily by subscribing my service for 1K $FISH a week.
    function burnFish(
        bytes32 _tokenId,
        uint256 _amount,
        bytes memory _data
    ) external {
        // Check if the tokedId exist
        require(level[_tokenId].xp != 0 || level[_tokenId].level != 0, "No exist");
        ILSP7Burnable(FISH).burn(_msgSender(), _amount * 10**18, _data);

        LevelData memory levelData = level[_tokenId];
        levelData.xp += _amount;

         level[_tokenId] = levelData;
    }

    /**
     * @notice Mints a new LukSeals NFT with custom metadata for the caller.
     * @dev This function handles all minting logic, including phase-specific checks (e.g., whitelist, token-gating),
     * payment processing for native tokens or LSP7 tokens, and token metadata assignment.
     * @param _phaseName The name of the phase the user is minting in. Must be the currently active phase.
     * @param _metadata The LSP4 verifiable metadata bytes to be associated with the new token.
     * @return A bytes32 tokenId.
     */
    function mintWithMetadata(bytes32 _phaseName, bytes memory _metadata) public payable nonReentrant whenNotPaused returns (bytes32) {
        // 1. Check if the total supply limit has been reached.
        require(tokenIdCounter.current() < MAX_SUPPLY, Errors.MaxSupplyExceeded());

        require(activePhase == _phaseName, Errors.PhaseNotActive());

        // Load phase data for cleaner access.
        PhaseData memory selectedPhase = phases[_phaseName];
        uint256 maxMint = selectedPhase.maxMintPerWallet;
        uint256 mintPrice = selectedPhase.price;
        address mintToken = selectedPhase.tokenAddress;

        // 3. Check for max mints per wallet for the selected phase.
        require(mintCount[msg.sender][_phaseName] < selectedPhase.maxMintPerWallet, Errors.MaxMintPerWalletExceeded());

        // 4. Phase-specific rules check.
        if (_phaseName == keccak256(bytes("phase1"))) {
            // Phase 1 has a supply cap and requires the sender to be whitelisted.
            require(whitelist[msg.sender] > 0, Errors.NotWhitelisted());
            require(totalSupply() < PHASE_ONE_TWO_SUPPLY_CAP, Errors.PhaseSupplyExceeded());
            require(mintCount[_msgSender()][_phaseName] < maxMint, Errors.MaxMintExceeded());
        } else if (_phaseName == keccak256(bytes("phase2"))) {
            require(totalSupply() < PHASE_ONE_TWO_SUPPLY_CAP, Errors.PhaseSupplyExceeded());
        } else if (_phaseName == keccak256(bytes("phase3"))) {
            // Phase 3 is only for LukSeals Member Card holders.
            require(memberCardContract.balanceOf(msg.sender) > 0, Errors.NotAMemberCardHolder());
        }

        // --- PAYMENT LOGIC ---

        if (mintPrice > 0) {
            if (mintToken == address(0)) {
                // Payment is with native token (LYX).
                if (msg.value < mintPrice) {
                    revert Errors.InsufficientPayment(mintPrice, msg.value);
                }
            } else {
                // Payment is with an LSP7 token (e.g., $FISH token).
                // The user must have approved this contract to spend their tokens.
                // The transferFrom call will revert if the allowance or balance is insufficient.
                ILSP7(mintToken).transfer(_msgSender(), address(this), mintPrice, true, "");
            }
        }

        // --- MINTING AND STATE UPDATE ---

        // Increment the token counter and get the new tokenId.
        tokenIdCounter.increment();
        bytes32 tokenId = bytes32(tokenIdCounter.current());

        // Mint the new LSP8 token.
        _mint({to: _msgSender(), tokenId: tokenId, force: true, data: ""});

        // Set the LSP4 verifiable metadata.
        _setDataForTokenId(tokenId, _LSP4_METADATA_KEY, _metadata);

        // Update the user's mint count for the current phase.
        mintCount[_msgSender()][_phaseName] = mintCount[_msgSender()][_phaseName] + 1;

        // Update level
        level[tokenId] = LevelData(0, 0);

        // Emit the `Minted` event.
        emit Minted(_msgSender(), tokenId, block.timestamp);

        return tokenId;
    }

    /**
     * @notice Withdraws a specific amount of an LSP7 token to a recipient.
     * @dev This function transfers an LSP7 token from the contract's balance to a specified recipient.
     * @param _LSP7Token The address of the LSP7 token contract.
     * @param _to The address of the recipient who will receive the tokens.
     * @param _amount The amount of tokens to withdraw.
     * @param _force If set to true, forces the transfer even if the recipient's contract does not support `LSP1-ERC725Y`.
     * @param _data Additional data to be sent with the transfer, which can be handled by the recipient's `LSP1` receiver hook.
     */
    function transferLSP7Token(
        address _LSP7Token,
        address _to,
        uint256 _amount,
        bool _force,
        bytes memory _data
    ) public onlyOwner {
        ILSP7(_LSP7Token).transfer(address(this), _to, _amount, _force, _data);
    }

    /// @notice Transfers the entire contract's ETH balance to the contract owner.
    /// @dev This function can only be called by the contract owner and is non-reentrant.
    function withdrawAll() public onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "No balance");
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Failed");

        // Emit the Withdrawal event to signal a successful withdrawal.
        emit Withdrawal(owner(), amount, block.timestamp);
    }

    /// @notice Pauses minting operations.
    /// @dev Only the contract owner can call this function. While paused, the `mintWithMetadata` function will revert.
    function pauseMinting() public onlyOwner {
        _pause();
    }

    /// @notice Unpauses minting operations.
    /// @dev Only the contract owner can call this function. This allows the `mintWithMetadata` function to be called again.
    function unpauseMinting() public onlyOwner {
        _unpause();
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

// The maximum number of tokens that can be minted.
uint8 constant TOTAL_SUPPLY = 100;

// The price to mint one token, denominated in the smallest unit of the $FISH token.
uint256 constant MINT_PRICE = 25_000 ether;

// The raw JSON metadata string for the LSP8 token, following the LSP4 standard.
string constant RAW_METADATA = unicode'{"LSP4Metadata":{"name":"Rich LukSeal","description":"Artwork by Leoisidro. A sick action figure to collect and support the Lukseal ecosystem. More features revealed on Lukseal Mint.","links":[{"title":"Website","url":"https://lukseals.club"},{"title":"ARF-I","url":"https://arf-i.lukseals.club"},{"title":"Mint","url":"https://play.lukseals.club"},{"title":"𝕏","url":"https://x.com/LukSeals"}],"attributes":[{"key":"Name","value":"Rich LukSeal"},{"key":"Symbol","value":"RICH"},{"key":"Standard","value":"LSP8"},{"key":"Blockchain","value":"LUKSO"},{"key":"Artist","value":"leoisidro"},{"key":"Author","value":"ArattaLabs"}],"icon":[{"width":512,"height":512,"url":"ipfs://bafkreifxfublp4hzvyrf2bnld56anbqfluiay6mlp6nsn7knrlleq3td5m","verification":{"method":"keccak256(bytes)","data":"0x1f39273b66f95fa949d56b8683e9306b81f651f9c87217c12fa68c7aba010076"}}],"backgroundImage":[],"assets":[{"url":"ipfs://bafybeidfamwajdmmcmla2dr3pyx6mrt5adhxk3bpiuioazx65yuegrxqxy","verification":{"method":"keccak256(bytes)","data":"0xdfb7dddb37c490cf7796bf6853eb2b6a9a7eee65b9fac67cdd8836146e647086"}}],"images":[[{"width":500,"height":500,"url":"ipfs://bafkreign32fklff6hrp4xgjoxetnokpr6gkthu2yonkwzwypnbbaxx3y5e","verification":{"method":"keccak256(bytes)","data":"0x31c3926e3b5a81043623794e26f83023562b7e6ef2ef7f0421f4ad04979fac4e"}}]]}}';

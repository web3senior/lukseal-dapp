// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

// The maximum number of tokens that can be minted.
uint16 constant TOTAL_SUPPLY = 300;

// The raw JSON metadata string for the LSP8 token, following the LSP4 standard.
string constant RAW_METADATA = unicode'{"LSP4Metadata":{"name":"FISHCAN","description":"The finest $FISH in town. Handle with care.","links":[{"title":"Website","url":"https://lukseals.club"},{"title":"ARF-I","url":"https://arf-i.lukseals.club"},{"title":"Mint","url":"https://fishcan.lukseals.club"},{"title":"𝕏","url":"https://x.com/LukSeals"}],"attributes":[{"key":"Name","value":"FISHCAN "},{"key":"Symbol","value":"CAN"},{"key":"Standard","value":"LSP8"},{"key":"Blockchain","value":"LUKSO"},{"key":"Author","value":"ArattaLabs"}],"icon":[{"width":512,"height":512,"url":"ipfs://bafkreifxfublp4hzvyrf2bnld56anbqfluiay6mlp6nsn7knrlleq3td5m","verification":{"method":"keccak256(bytes)","data":"0x1f39273b66f95fa949d56b8683e9306b81f651f9c87217c12fa68c7aba010076"}}],"backgroundImage":[],"assets":[],"images":[[{"width":500,"height":500,"url":"ipfs://bafybeibrcqo3ctkkqa7xz3dagc5v6smlfav7vqzxdqpaepwmuolokdp4ky","verification":{"method":"keccak256(bytes)","data":"0x6af770403eabedaa52ff3c2ce8d408a398759736b09fbf71f144d7693e030086"}}]]}}';

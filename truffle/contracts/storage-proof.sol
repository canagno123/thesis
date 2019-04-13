pragma solidity ^0.5.0;

// Provides a Merkle Tree Proof Verification implementation.
//
// The Merkle Tree is assumed to be using the `keccak256` hash algorithm.
library StorageProof {

    // Size of a hash digest, in bytes.
    uint internal constant HASH_DIGEST_SIZE = 32;

    // Verifies a Merkle Tree Proof.
    function verify(bytes32 rootHash, bytes memory leaf, bytes32[] memory nodeHashes, bool[] memory nodeOrientations)
    public
    pure
    returns (bool)
    {
        if ((nodeHashes.length == 0) ||
            (nodeHashes.length != nodeOrientations.length)) {
            return false;
        }

        // Calculate the hash digest of the leaf node.
        bytes32 curHash = keccak256(leaf);

        bytes memory buffer = new bytes(2 * HASH_DIGEST_SIZE);

        uint bufAddr = dataPtr(buffer);

        // Verify that the given Merkle Tree Proof is valid
        // and leads to the provided `rootHash`.
        for (uint i = 0; i < nodeHashes.length; i++) {
            if (nodeOrientations[i]) {
                // This is a left child node.
                copyBytes32(bufAddr, nodeHashes[i]);
                copyBytes32(bufAddr + HASH_DIGEST_SIZE, curHash);
            } else {
                // This is a right child node.
                copyBytes32(bufAddr, curHash);
                copyBytes32(bufAddr + HASH_DIGEST_SIZE, nodeHashes[i]);
            }

            curHash = keccak256(buffer);
        }

        return (curHash == rootHash);
    }

    // Copies `bts` to the memory location pointer by `dst`.
    function copyBytes32(uint dst, bytes32 bts) internal pure {
        assembly {
            mstore(dst, bts)
        }
    }

    // Returns the memory address of the data portion of `bts`.
    //
    // Ref:
    //      https://github.com/ethereum/solidity-examples/blob/master/src/unsafe/Memory.sol
    function dataPtr(bytes memory bts) internal pure returns (uint addr) {
        assembly {
            addr := add(bts, /* BYTES_HEADER_SIZE */ 32)
        }
    }
}

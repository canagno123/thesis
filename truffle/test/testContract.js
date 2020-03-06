const StorageProof = artifacts.require('StorageProof')
const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')

const buf2hex = x => '0x'+x.toString('hex')

contract('Contracts', (accounts) => {
  let contract

  before('setup', async () => {
    contract = await StorageProof.new()
  })

  context('StorageProof', () => {
    describe('merkle proofs', () => {
      it('should return true for valid merkle proof (example)', async () => {
        const leaves = ["Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis"," nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum d","olore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident","sunt in culpa qui officia deserunt mollit anim id est laborum."].map(v => keccak256(v))
        const tree = new MerkleTree(leaves, keccak256, { sort: true })
        const root = tree.getHexRoot()
        const leaf = "sunt in culpa qui officia deserunt mollit anim id est laborum."
        const leafkecc = keccak256(leaf)
        console.log(root);  
        console.log(leaf);
        const proof = tree.getHexProof(leafkecc)
        console.log(proof);
        const verified = await contract.verify2.call(root, leaf, proof)
        assert.equal(verified, true)

        // const badLeaves = ['a', 'b', 'x', 'd'].map(v => keccak256(v))
        // const badTree = new MerkleTree(badLeaves, keccak256, { sort: true })
        // const badProof = badTree.getHexProof(leaf)

        // const badVerified = await contract.verify2.call(root, leaf, badProof)
        // assert.equal(badVerified, false)
      })
    })
    })
    });
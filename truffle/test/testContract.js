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
        const leaves = ["** Time measurement may be an ","issue. Epochs last 100 hours, ","unable to determine when the e","poch started etc.","** leaf, nodeHashes, nodeOrien","tations must be provided in ev","ery call for a proof validatio","n."].map(v => keccak256(v))
        const tree = new MerkleTree(leaves, keccak256, { sort: true })
        const root = tree.getHexRoot()
        const leaf = "** Time measurement may be an "
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
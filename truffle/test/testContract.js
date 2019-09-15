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
        const leaves = ['', '** Time measurement may be an issue. Epochs last 100 hours, unable to determine when the epoch started etc.', '',
         '** leaf, nodeHashes, nodeOrientations must be provided in every call for a proof validation.'].map(v => keccak256(v))
        const tree = new MerkleTree(leaves, keccak256, { sort: true })
        const root = tree.getHexRoot()
        const leaf = keccak256('** leaf, nodeHashes, nodeOrientations must be provided in every call for a proof validation.')
        // console.log(root);  
        // console.log(tree);
        console.log(leaf);
        const proof = tree.getHexProof(leaf)
        console.log(proof);
        const verified = await contract.verify2.call(root, leaf, proof)
        assert.equal(verified, true)

        const badLeaves = ['a', 'b', 'x', 'd'].map(v => keccak256(v))
        const badTree = new MerkleTree(badLeaves, keccak256, { sort: true })
        const badProof = badTree.getHexProof(leaf)

        const badVerified = await contract.verify2.call(root, leaf, badProof)
        assert.equal(badVerified, false)
      })
    })
    })
    });
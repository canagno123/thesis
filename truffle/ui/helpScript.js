const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256')

window.createRootHex = function(leavesRaw){
    const leaves = leavesRaw.map(v => keccak256(v))
    const tree = new MerkleTree(leaves, keccak256, { sort: true })
    const root = tree.getHexRoot()
    console.log("Leaves: " + leaves)
    console.log("Root: " + root)
    return root;
}
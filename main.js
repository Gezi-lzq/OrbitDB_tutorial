const NPP = require('./newpieceplease')

NPP.onready = () => {
    console.log("IPFS node identifier ",NPP.orbitdb.id)
    console.log("database address ",NPP.pieces.id)
}

NPP.create()


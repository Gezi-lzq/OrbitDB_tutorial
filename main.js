const NPP = require("./newpieceplease");
const IPFS = require("ipfs");

async function main() {
  NPP.onready = () => {
    console.log("IPFS node identifier ", NPP.orbitdb.id);
    console.log("database address ", NPP.pieces.id);
  };
  await NPP.create();
  console.log("created");
  // test
  await addPieceTest();
  await getPieceTest();
  await updatePieceTest();
  await deletePieceTest();
}

async function addPieceTest() {
  let cid = await NPP.addNewPiece(
    "QmNR2n4zywCV61MeMLB6JwPueAPqheqpfiA4fLPMxouEmQ"
  );
  // 将 CID 的字符串表示形式转换为CID类
  cid = new IPFS.CID(cid);

  const content = await NPP.node.dag.get(cid);
  console.log(content.value.payload);
}

async function getPieceTest() {
  console.log("— — getAllPieces — —");
  pieces = NPP.getAllPieces();
  pieces.forEach((piece) => {
    console.log(piece);
  });

  console.log(
    "— — getPieceByHash QmNR2n4zywCV61MeMLB6JwPueAPqheqpfiA4fLPMxouEmQ  — —"
  );
  piece = NPP.getPieceByHash("QmNR2n4zywCV61MeMLB6JwPueAPqheqpfiA4fLPMxouEmQ");
  console.log(piece);
}

async function updatePieceTest() {
  console.log("--- updatePieceTest ---");
  const cid = await NPP.updatePieceByHash(
    "QmNR2n4zywCV61MeMLB6JwPueAPqheqpfiA4fLPMxouEmQ",
    "Harpsichord"
  );
  console.log(cid);
}

async function deletePieceTest() {
  const cid = await NPP.deletePieceByHash(
    "QmNR2n4zywCV61MeMLB6JwPueAPqheqpfiA4fLPMxouEmQ"
  );
  const content = await NPP.node.dag.get(new IPFS.CID(cid));
  console.log(content.value.payload);
}

main();

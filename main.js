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

  await practiceCountTest();
  await PrifileFieldTest();
  await IPFSConnectTest();

  await deletePieceTest();

  await getInpfsPeersTest();
  // await connectToPeerTest();
  await subscribeTest();
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
  console.log("---deletePieceTest---");
  const cid = await NPP.deletePieceByHash(
    "QmNR2n4zywCV61MeMLB6JwPueAPqheqpfiA4fLPMxouEmQ"
  );
  const content = await NPP.node.dag.get(new IPFS.CID(cid));
  console.log(content.value.payload);
}

async function practiceCountTest() {
  console.log("--practiceCountTest---");
  const piece = NPP.getPieceByHash(
    "QmNR2n4zywCV61MeMLB6JwPueAPqheqpfiA4fLPMxouEmQ"
  );
  const cid = await NPP.incrementPracticeCounter(piece);

  const content = await NPP.node.dag.get(new IPFS.CID(cid));
  console.log(content.value.payload);
}

async function PrifileFieldTest() {
  console.log("---PrifileFieldTest---");
  let profileFields = NPP.getAllProfileFields();
  console.log(profileFields);

  console.log("---updateProfileFieldTest---");
  await NPP.updateProfileField("username", "gezi");
  profileFields = NPP.getAllProfileFields();
  console.log(profileFields);

  console.log("---deleteProfileFieldTest---");
  const cid = await NPP.deleteProfileField("username");
  const content = await NPP.node.dag.get(new IPFS.CID(cid));
  console.log(content.value.payload);
}

async function IPFSConnectTest() {
  console.log("---IPFSConnectTest---");
  // await NPP.node.bootstrap.reset();
  const list = await NPP.node.bootstrap.list();
  console.log(list);

  console.log("---Enabling the swarm---");
  NPP.node.config.set(
    "Addresses.Swarm",
    ["/ip4/0.0.0.0/tcp/4002", "/ip4/127.0.0.1/tcp/4003/ws"],
    console.log
  );
  const id = await NPP.node.id();
  console.log("node publishing address", id.addresses);
}

async function getInpfsPeersTest() {
  console.log("---getInpfsPeersTest---");
  const peers = await NPP.getIpfsPeers();
  console.log(peers.length);
}

async function connectToPeerTest() {
  console.log("---connectToPeerTest---");
  NPP.onpeerconnect = console.log;
  await NPP.connectToPeer("QmWxWkrCcgNBG2uf1HSVAwb9RzcSYYC2d6CRsfJcqrz2FX");
}

async function subscribeTest() {
  console.log("---subscribeTest---")
  NPP.onmessage = console.log;
  let data = { test: "test" };
  const hash = "QmXG8yk8UJjMT6qtE2zSxzz3U7z5jSYRgVWLCUFqAVnByM";
  await NPP.sendMessage(hash, data);
}

main();

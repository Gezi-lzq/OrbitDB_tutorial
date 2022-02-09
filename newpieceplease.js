class NewPiecePlease {
  constructor(Ipfs, OrbitDB) {
    this.Ipfs = Ipfs;
    this.OrbitDB = OrbitDB;
  }
  async create() {
    // 创造一个ipfs实例
    this.node = await this.Ipfs.create({
      // preload: { enabled: false },
      relay: { enabled: true, hop: { enabled: true, active: true } },
      repo: "./ipfs",
      EXPERIMENTAL: { pubsub: true },
      // config: { Bootstrap: [],Addresses: { Swarm: [] },},
    });

    this.node.bootstrap.reset()

    await this._init();
  }

  async _init() {
    // IPFS节点Info
    const peerInfo = await this.node.id()
    // 返回一个已解析为 orbitdb 实例
    this.orbitdb = await this.OrbitDB.createInstance(this.node);
    // 基础配置 访问许可 仅能创作者本人访问
    this.defaultOptions = {
      accessController: { write: [this.orbitdb.identity.id] },
    };
    // 具体配置 按照hash索引
    const docStoreOptions = {
      ...this.defaultOptions,
      indexBy: "hash",
    };

    //创建并打开一个 docstore 数据库 命名为 'pieces'（曲目）
    this.pieces = await this.orbitdb.docstore("pieces", docStoreOptions)
    //  当我们需要数据库中最新和最全面的数据快照时，就需要调用这个函数
    //  根据content addresses 将信息加载到内存
    await this.pieces.load();

    //创建并打开一个 k-v 数据库 命名为 'user'
    this.user = await this.orbitdb.kvstore('user', this.defaultOptions)
    await this.user.load()

    // // 插入数据 建立 'pieces' -> pieces database address 的映射
    // await this.user.set('pieces', this.pieces.id)

    await this.loadFixtureData({
      'username': Math.floor(Math.random() * 1000000),
      'pieces': this.pieces.id,
      'nodeId': peerInfo.id
    })

    // 事件处理程序，用于处理连接到对等点的情况
    this.node.libp2p.connectionManager.on('peer:connect', this.handlePeerConnected.bind(this))

    this.onready();
  }

  async addNewPiece(hash, instrument = "Piano") {
    const existingPiece = this.getPieceByHash(hash)
    if (existingPiece) {
      const cid = await this.updatePieceByHash(hash, instrument)
      return cid
    }

    const dbName = 'counter.' + hash.substr(20,20)
    const counter = await this.orbitdb.counter(dbName, this.defaultOptions)

    const cid = await this.pieces.put({ hash, instrument,
      counter: counter.id
    })
    return cid;
  }

  getAllPieces() {
    // 传递一个空字符串返回所有piece
    const pieces = this.pieces.get('')
    return pieces
  }

  getPieceByHash(hash) {
    // 对数据库索引执行部分字符串搜索
    const singlePiece = this.pieces.get(hash)[0]
    return singlePiece
  }

  getPieceByInstrument(instrument) {
    return this.pieces.query((piece) => piece.instrument === instrument)
  }

  async updatePieceByHash (hash, instrument= 'Piano') {
    const piece = await this.getPieceByHash(hash)
    piece.instrument = instrument
    const cid = await this.pieces.put(piece)
    return cid
  }

  async deletePieceByHash (hash) {
    const cid = await this.pieces.del(hash)
    return cid
  }

  async getPracticeCount (piece) {
    const counter = await this.orbitdb.counter(piece.counter)
    await counter.load()
    return counter.value
  }

  async incrementPracticeCounter (piece) {
    const counter = await this.orbitdb.counter(piece.counter)
    await counter.load()
    const cid = await counter.inc()
    return cid
  }

  async deleteProfileField (key) {
    const cid = await this.user.del(key)
    return cid
  }

  getAllProfileFields () {
    return this.user.all
  }

  getProfileField (key) {
    return this.user.get(key)
  }

  async updateProfileField (key, value) {
    const cid = await this.user.set(key,value)
    return cid
  }

  async loadFixtureData (fixtureData) {
    const fixtureKeys = Object.keys(fixtureData)
    for (let i in fixtureKeys) {
      let key = fixtureKeys[i]
      if(!this.user.get(key)) 
        await this.user.set(key, fixtureData[key])
    }
  }

  async getIpfsPeers() {
    const peers = await this.node.swarm.peers()
    return peers
  }

  async connectToPeer (multiaddr, protocol = '/p2p-circuit/ipfs/') {
    try {
      await this.node.swarm.connect(protocol + multiaddr)
    } catch(e) {
      throw (e)
    }
  }

  handlePeerConnected (ipfsPeer) {
    const ipfsId = ipfsPeer.id.toB58String()
    if (this.onpeerconnect) this.onpeerconnect(ipfsId)
  }

}

try {
  const Ipfs = require("ipfs");
  const OrbitDB = require("orbit-db");

  module.exports = exports = new NewPiecePlease(Ipfs, OrbitDB);
} catch (e) {
  window.NPP = new NewPiecePlease(window.Ipfs, window.OrbitDB);
}

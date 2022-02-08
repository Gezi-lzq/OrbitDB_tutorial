class NewPiecePlease {
  constructor(Ipfs, OrbitDB) {
    this.Ipfs = Ipfs;
    this.OrbitDB = OrbitDB;
  }
  async create() {
    // 创造一个ipfs实例
    this.node = await this.Ipfs.create({
      preload: { enabled: false },
      repo: "./ipfs",
      EXPERIMENTAL: { pubsub: true },
      config: {
        Bootstrap: [],
        Addresses: { Swarm: [] },
      },
    });

    await this._init();
  }

  async _init() {
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

}

try {
  const Ipfs = require("ipfs");
  const OrbitDB = require("orbit-db");

  module.exports = exports = new NewPiecePlease(Ipfs, OrbitDB);
} catch (e) {
  window.NPP = new NewPiecePlease(window.Ipfs, window.OrbitDB);
}

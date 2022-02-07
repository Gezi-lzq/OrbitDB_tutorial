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

    this._init();
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
      await this.updatePieceByHash(hash, instrument)
      return
    }
    const cid = await this.pieces.put({ hash, instrument })
    return cid;
  }

  getAllPieces() {
    const pieces = this.pieces.get('')
    return pieces
  }

  getPieceByHash(hash) {
    const singlePiece = this.pieces.get(hash)[0]
    return singlePiece
  }

  getPieceByInstrument(instrument) {
    return this.pieces.query((piece) => piece.instrument === instrument)
  }
  
}

try {
  const Ipfs = require("ipfs");
  const OrbitDB = require("orbit-db");

  module.exports = exports = new NewPiecePlease(Ipfs, OrbitDB);
} catch (e) {
  window.NPP = new NewPiecePlease(window.Ipfs, window.OrbitDB);
}

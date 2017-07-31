<egypt>

  <header>
    <h1>EGYPT
      <small>version: 0.0.3 (2017-07-31)
        <a href="https://github.com/Kazunori-Kimura/egypt-app"><i class="fa fa-github" aria-hidden="true"></i>ソースコード</a>
      </small>
    </h1>
  </header>
  <div id="controller">
    <button class="btn btn-default" onclick={ reset }>
      <i class="fa fa-repeat"></i>
      ギブアップ
    </button>
  </div>
  <game-board></game-board>
  <game-status></game-status>

  <style>
    egypt {
      width: 100vw;
      min-height: 100vh;

      display: grid;
      grid-template-rows: 80px 80px 1fr;
      grid-template-columns: 2fr 1fr;
      grid-template-areas:
        "header header"
        "board controller"
        "board status";
    }
    header {
      grid-area: header;
      padding: 5px 20px;
    }
    h1 small {
      font-size: 0.7em;
      font-weight: normal;
      color: #999;
      margin-left: 40px;
    }
    #controller {
      grid-area: controller;
    }
    game-board {
      grid-area: board;
    }
    game-status {
      grid-area: status;
    }
    @media screen and (orientation: portrait) {
      egypt {
        grid-template-columns: 1fr;
        grid-template-rows: 80px 80px 1fr 120px;
        grid-template-areas:
          "header"
          "controller"
          "board"
          "status";
      }
    }
  </style>

  <script>
    const Picture = require("../lib/picture");

    this.observer = opts.observer;

    const map = `00000000
0000v000
00000000
0>003000
00030000
00000000
00000000
00000000`;

    this.data = [];

    this.on("before-mount", () => {
      this.init();
    });

    this.on("mount", () => {
      this.observer.trigger("status-update", this.data);
    });

    /**
     * 初期化処理
     */
    init() {
      // 配列を初期化
      this.data = [];

      const lines = map.split("\n");
      lines.forEach((line) => {
        const arr = [];
        for (let i=0; i<line.length; i++) {
          arr.push(line.charAt(i));
        }
        this.data.push(arr);
      });
    }

    /**
     * 状態を元に戻す
     */
    reset() {
      this.init();
      this.observer.trigger("load", this.data);
    }

    isPicture(value) {
      return Picture.isPicture(value);
    }

    icon(value, large=false) {
      return Picture.getIconClass(value, large);
    }

  </script>
</egypt>

<game-board>
  <div id="content">
    <virtual each={ row, rowIndex in data }>
      <div 
        each={ item, colIndex in row }
        class={
          "panel": true,
          "erase": isErase(rowIndex, colIndex)
        }
        onclick={ parent.clickPanel }
        data-row-index={rowIndex}
        data-col-index={colIndex}>
        <span if={ item != "0" }>
          <i class="{ parent.getIcon(item) }"></i>
        </span>
      </div>
    </virtual>
  </div>
  <div id="clear" if={ isCleared }>
    <h2>{ title }</h2>
    <p>{ message }</p>
  </div>


  <style>
    game-board {
      position: relative;
    }
    #content {
      margin-left: 20px;
      border: 1px solid #999;
      display: flex;
      flex-wrap: wrap;
      
      width: calc(100vh - 100px);
      height: calc(100vh - 100px);
    }
    #clear {
      position: absolute;
      top: 0px;
      left: 20px;
      padding: 40px 60px;
      font-size: 2em;
      background-color: rgba(255, 255, 255, 0.7);

      width: calc(100vh - 220px);
      height: calc(100vh - 180px);
    }
    @media screen and (orientation: portrait) {
      #content {
        width: calc(100vh - 280px);
        height: calc(100vh - 280px);
      }
      #clear {
        width: calc(100vh - 400px);
        height: calc(100vh - 360px);
      }
    }

    .panel {
      width: calc(100%/8 - 2px);
      height: calc(100%/8 - 2px);
      text-align: center;
      border: 1px solid #ccc;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    @keyframes erase {
      0% { background: #fff; }
      50% { background: yellow; }
      100% { background: #fff; }
    }

    .erase {
      animation: erase 0.5s ease 0s infinite;
    }
  
  </style>

  <script>
    // 方向
    const DIRECTION = {
      "UP": 0,
      "DOWN": 1,
      "LEFT": 2,
      "RIGHT": 3
    };

    this.data = this.parent.data;
    this.observer = this.parent.observer;

    // 消去対象パネル
    this.erasePanels = new Set();

    // 操作可能かどうか
    this.isControllable = true;

    this.isCleared = false;
    this.title = "CLEAR!!";
    this.message = "click to go to next stage...";

    /**
     * パネルのクリック
     *
     * @param {Event} e
     */
    clickPanel(e) {
      if (!this.isControllable) {
        return;
      }

      // target.dataset.{row|col}Index
      const target = e.currentTarget;
      console.log(target);
      
      // クリックされたパネル
      switch(e.item.item) {
        case "^": 
          this.moveColumn(target.dataset.colIndex, DIRECTION.UP);
          break;
        case "v":
          this.moveColumn(target.dataset.colIndex, DIRECTION.DOWN);
          break;
        case "<":
          this.moveRow(target.dataset.rowIndex, DIRECTION.LEFT);
          break;
        case ">":
          this.moveRow(target.dataset.rowIndex, DIRECTION.RIGHT);
          break;
        default:
          //何もしない
          return;
      }
      
      // パネルが揃っているかチェック
      this.verify();
      // 揃っているパネルがある
      if (this.erasePanels.size > 0) {
        // アニメーションしてるから操作不可とする
        this.isControllable = false;
        // 1秒後に揃ったパネルを消す
        setTimeout(this.erase, 1000);
      }
    }

    /**
     * 行方向の移動
     *
     * @param {number} index
     * @param {number} direction - left or right
     */
    moveRow(index, direction) {
      const row = this.data[index];

      let item;
      switch(direction) {
        case DIRECTION.LEFT:
          // 先頭要素を取り出して末尾に追加
          item = row.shift();
          row.push(item);
          break;
        case DIRECTION.RIGHT:
          // 末尾の要素を取り出して先頭に追加
          item = row.pop();
          row.unshift(item);
          break;
      }
    }

    /**
     * 列方向の移動
     *
     * @param {number} index
     * @param {number} direction - up or down
     */
    moveColumn(index, direction) {
      // 該当列を新しい配列に保持
      const items = [];
      this.data.forEach((row) => {
        items.push(row[index]);
      });

      let item;
      switch(direction) {
        case DIRECTION.UP:
          // 先頭要素を取り出して末尾に追加
          item = items.shift();
          items.push(item);
          break;
        case DIRECTION.DOWN:
          // 末尾の要素を取り出して先頭に追加
          item = items.pop();
          items.unshift(item);
          break;
        default:
          return;
      }

      // dataに変更を反映
      for(let i=0; i<this.data.length; i++) {
        this.data[i][index] = items[i];
      }
    }

    /**
     * 消去対象のパネルかどうか判定する
     */
    verify() {
      this.erasePanels.clear();

      this.data.forEach((row, rowIndex) => {
        row.forEach((item, colIndex) => {
          if (!this.parent.isPicture(item)) {
            return;
          }
          // 上
          if (rowIndex > 0) {
            const target = this.data[rowIndex-1][colIndex];
            if (item === target) {
              this.erasePanels.add(`${rowIndex}:${colIndex}`);
              return;
            }
          }
          // 下
          if (rowIndex < this.data.length - 1) {
            const target = this.data[rowIndex+1][colIndex];
            if (item === target) {
              this.erasePanels.add(`${rowIndex}:${colIndex}`);
              return;
            }
          }
          // 左
          if (colIndex > 0) {
            const target = this.data[rowIndex][colIndex-1];
            if (item === target) {
              this.erasePanels.add(`${rowIndex}:${colIndex}`);
              return;
            }
          }
          // 右
          if (colIndex < row.length - 1) {
            const target = this.data[rowIndex][colIndex+1];
            if (item === target) {
              this.erasePanels.add(`${rowIndex}:${colIndex}`);
              return;
            }
          }
        });
      });
    }

    /**
     * 消去対象かどうか
     *
     * @param {number} rowIndex
     * @param {number} colIndex
     */
    isErase(rowIndex, colIndex) {
      const key = `${rowIndex}:${colIndex}`;
      return this.erasePanels.has(key);
    }

    /**
     * 揃ったパネルを消す
     */
    erase() {
      this.erasePanels.forEach((item) => {
        const position = this.parseIndex(item);
        if (position) {
          this.data[position.row][position.column] = "0";
        }
      });

      // Setをクリア
      this.erasePanels.clear();

      // statusを更新
      this.observer.trigger("status-update", this.data);
    }

    /**
     * `rowIndex:colIndex` を { row: number, column: number } に変換
     *
     * @param {string} key
     * @return {object}
     */
    parseIndex(key) {
      const arr = key.split(":");
      if (arr.length === 2) {
        const row = parseInt(arr[0]);
        const column = parseInt(arr[1]);
        return { row, column };
      }
      return null;
    }

    /**
     * アイコンを取得
     *
     * @param {string} key
     */
    getIcon(key) {
      return this.parent.icon(key, true);
    }

    /**
     * データの再読込
     */
    this.observer.on("load", (data) => {
      // アイコン初期化
      this.data = data;
      // Setをクリア
      this.erasePanels.clear();
      // statusを更新
      this.observer.trigger("status-update", this.data);
    })

    /**
     * ステータス更新完了
     */
    this.observer.on("status-updated", () => {
      // 操作可能とする
      this.isControllable = true;
      // 再描画
      this.update();
    });

    /**
     * ステージクリア
     */
    this.observer.on("stage-clear", () => {
      // フラグを更新
      this.isCleared = true;
      // 再描画
      this.update();
    });

  </script>
</game-board>

<game-status>
  <h2>Status</h2>

  <virtual each={item in status}>
    <p><i class="{ parent.getIcon(item.key) }"></i> : {item.count}</p>
  </virtual>

  <script>
    this.observer = this.parent.observer;

    this.status = [];

    this.observer.on("status-update", (data) => {
      console.log("status-update");
      console.log(data);
      const stat = new Map();

      // ステータスを集計
      data.forEach((row) => {
        row.forEach((item) => {
          if (this.parent.isPicture(item)) {
            let count = 0;
            if (stat.has(item)) {
              count = stat.get(item);
            }
            count++;
            stat.set(item, count);
          }
        });
      });

      // 表示用に整形
      const ret = [];
      [...stat.keys()].sort().forEach((key) => {
        ret.push({ key, count: stat.get(key) });
      });
      
      // ステータス更新
      this.status = ret;
      if (ret.length > 0) {
        // 更新完了
        this.observer.trigger("status-updated");
      } else {
        // ステージクリア
        this.observer.trigger("stage-clear");
      }

      // 再描画
      this.update();
    });

    /**
     * アイコンを取得
     *
     * @param {string} key
     */
    getIcon(key) {
      return this.parent.icon(key);
    }
  </script>
</game-status>

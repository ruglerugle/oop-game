/* ============================================================
   実験ウィジェット（オブジェクト指向クエスト）
   <div class="lab" data-lab="種類" data-id="課題ID"> を見つけて組み立てる。
   コードの例はすべて Java。
   ============================================================ */
(function (global) {
  "use strict";
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function hl(code) {
    return esc(code).replace(/\b(class|extends|implements|interface|abstract|public|private|protected|static|new|void|int|double|String|return|this|super|if|instanceof|for|final)\b/g, '<span class="kw">$1</span>')
      .replace(/(\/\/[^\n]*)/g, '<span class="cm">$1</span>');
  }
  function head(title) { return '<div class="lab-head"><span class="lab-badge">実験</span><span class="lab-title">' + title + "</span></div>"; }
  function prep(root) {
    var id = root.getAttribute("data-id");
    if (id) root.setAttribute("data-task", id);
    return !!(id && global.QUEST && global.QUEST.isTaskDone(id));
  }
  function done(root, msg) {
    if (!root.classList.contains("solved")) {
      root.classList.add("solved");
      var b = root.querySelector(".lab-badge");
      if (b) b.textContent = "✓ 達成";
      var id = root.getAttribute("data-id");
      if (id && global.QUEST) global.QUEST.taskDone(root, id);
    }
    if (msg) say(root, msg, true);
  }
  function say(root, msg, ok) {
    var s = root.querySelector(".lab-status");
    if (s) { s.innerHTML = msg; s.className = "lab-status" + (ok ? " ok" : ""); }
  }

  /* ---------- 1. コピペの修正漏れ ---------- */
  function dup(root) {
    var already = prep(root);
    var fixed = [false, false, false];
    var NAMES = ["Dog", "Cat", "Bird"];
    root.innerHTML = head("決まりが変わった！ 3つのクラスを直す") +
      '<p>飼育係から連絡：「えさの量は体重×0.1 ではなく、体重×0.05 に変更」。どのクラスも同じ計算を持っている。押して直そう。</p>' +
      '<div class="dup-grid"></div><p class="lab-status" aria-live="polite"></p>';
    function draw() {
      root.querySelector(".dup-grid").innerHTML = NAMES.map(function (n, i) {
        return '<button type="button" class="dup-card' + (fixed[i] ? " ok" : "") + '" data-i="' + i + '"><pre class="code">' +
          hl("class " + n + " {\n  double weight;\n  double food() {\n    return weight * " + (fixed[i] ? "0.05" : "0.1") + ";\n  }\n}") + "</pre><span>" + (fixed[i] ? "✓ 直した" : "ここを直す") + "</span></button>";
      }).join("");
      root.querySelectorAll(".dup-card").forEach(function (b) {
        b.addEventListener("click", function () { fixed[+b.getAttribute("data-i")] = true; draw(); check(); });
      });
    }
    function check() {
      var n = fixed.filter(Boolean).length;
      if (n === 3 || already) done(root, "3か所とも直した。動物が100種類いたら100か所。1か所でも直し忘れると、その動物だけ量がまちがったままになる。");
      else say(root, n + " / 3 か所直した。");
    }
    draw();
    if (already) { fixed = [true, true, true]; draw(); check(); } else say(root, "0 / 3 か所直した。");
  }

  /* ---------- 2. クラスからインスタンスを作る ---------- */
  function instances(root) {
    var already = prep(root);
    var objs = [], addr = 0x1a20;
    root.innerHTML = head("new で設計図から実物を作る") +
      '<pre class="code">' + hl("class Dog {\n  String name;   // フィールド（1匹ごとの値）\n  int age;\n  Dog(String name, int age) {   // コンストラクタ\n    this.name = name;\n    this.age = age;\n  }\n  void bark() { System.out.println(name + \"：ワン！\"); }\n}") + "</pre>" +
      '<div class="row"><label>名前 <input class="i-name" value="ポチ" maxlength="8"></label><label>年齢 <input class="i-age" type="number" value="3" min="0" max="30" style="width:4em"></label><button type="button" class="btn btn-primary lab-new">new Dog(名前, 年齢)</button></div>' +
      '<div class="objs"></div><div class="cpu-log out" aria-live="polite"></div><p class="lab-status"></p>';
    function draw() {
      root.querySelector(".objs").innerHTML = objs.map(function (o, i) {
        return '<div class="obj"><div class="obj-h">Dog のインスタンス <small>番地 0x' + o.addr.toString(16) + "</small></div><div>name ＝ <b>" + esc(o.name) + "</b></div><div>age ＝ <b>" + o.age + '</b></div><button type="button" class="btn" data-i="' + i + '">.bark()</button></div>';
      }).join("");
      root.querySelectorAll(".obj .btn").forEach(function (b) {
        b.addEventListener("click", function () { var o = objs[+b.getAttribute("data-i")]; root.querySelector(".out").textContent = "d" + (+b.getAttribute("data-i") + 1) + ".bark() → " + o.name + "：ワン！（自分の name を使う）"; });
      });
    }
    root.querySelector(".lab-new").addEventListener("click", function () {
      var nm = root.querySelector(".i-name").value.trim() || "名無し";
      var age = +root.querySelector(".i-age").value || 0;
      objs.push({ name: nm, age: age, addr: addr }); addr += 0x20;
      draw();
      root.querySelector(".out").textContent = "Dog d" + objs.length + " = new Dog(\"" + nm + "\", " + age + ");　→ ヒープに新しいインスタンスができ、コンストラクタが name と age を入れた。";
      if (objs.length >= 3 || already) done(root, "同じ設計図（クラス）から作っても、インスタンスはそれぞれ自分の name と age を持っている。");
      else say(root, "あと " + (3 - objs.length) + " 匹作ってみよう（名前を変えて）。");
    });
    if (already) done(root, "この課題は達成済み"); else say(root, "名前と年齢を変えながら、3匹作ってみよう。");
  }

  /* ---------- 3. 継承：メソッドを探す ---------- */
  function inherit(root) {
    var already = prep(root);
    var CL = {
      Animal: { parent: null, own: ["String name", "eat()", "sleep()"] },
      Mammal: { parent: "Animal", own: ["nurse()（お乳で育てる）"] },
      Bird: { parent: "Animal", own: ["layEgg()（卵を産む）"] },
      Dog: { parent: "Mammal", own: ["bark()"] },
      Cat: { parent: "Mammal", own: ["purr()（のどを鳴らす）"] }
    };
    var POS = { Animal: [210, 30], Mammal: [120, 110], Bird: [300, 110], Dog: [60, 190], Cat: [180, 190] };
    var seen = {};
    root.innerHTML = head("クラスを押して、使えるものを調べる") +
      '<svg viewBox="0 0 420 230" width="420" class="tree" role="img" aria-label="クラスの親子関係"></svg><div class="cpu-log out" aria-live="polite"></div><p class="lab-status"></p>';
    var svg = root.querySelector("svg");
    function draw(sel) {
      var h = '<defs><marker id="tri" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M0,0 L11,6 L0,12 z" fill="#fff" stroke="#3463b0"/></marker></defs>';
      Object.keys(CL).forEach(function (c) {
        var p = CL[c].parent;
        if (p) h += '<line x1="' + POS[c][0] + '" y1="' + (POS[c][1] - 16) + '" x2="' + POS[p][0] + '" y2="' + (POS[p][1] + 18) + '" stroke="#3463b0" stroke-width="2" marker-end="url(#tri)"/>';
      });
      Object.keys(CL).forEach(function (c) {
        var on = sel && (c === sel || isAnc(c, sel));
        h += '<g class="cls" data-c="' + c + '" style="cursor:pointer"><rect x="' + (POS[c][0] - 48) + '" y="' + (POS[c][1] - 16) + '" width="96" height="32" rx="6" fill="' + (c === sel ? "#ffe08a" : on ? "#e3ecfa" : "#fff") + '" stroke="#3463b0" stroke-width="2"/><text x="' + POS[c][0] + '" y="' + (POS[c][1] + 5) + '" text-anchor="middle" font-size="14" font-weight="900">' + c + "</text></g>";
      });
      svg.innerHTML = h;
      svg.querySelectorAll(".cls").forEach(function (g) { g.addEventListener("click", function () { pick(g.getAttribute("data-c")); }); });
    }
    function isAnc(a, c) { var p = CL[c].parent; while (p) { if (p === a) return true; p = CL[p].parent; } return false; }
    function pick(c) {
      seen[c] = true;
      draw(c);
      var chain = [], k = c;
      while (k) { chain.push(k); k = CL[k].parent; }
      root.querySelector(".out").innerHTML = chain.map(function (x, i) {
        return (i === 0 ? "<b>" + x + " が自分で書いたもの</b>" : x + " から受け継いだもの") + "：" + CL[x].own.join("、");
      }).join("<br>") + "<br>見つけ方：呼ばれたメソッドを、まず " + c + " で探し、無ければ親、その親……と上へたどる。";
      var leaves = ["Dog", "Cat", "Bird"].every(function (x) { return seen[x]; });
      if (leaves || already) done(root, "Dog も Cat も Bird も、Animal に1回だけ書いた eat() を使える。");
      else say(root, "Dog・Cat・Bird の3つを押してみよう。");
    }
    draw(null);
    if (already) done(root, "この課題は達成済み"); else say(root, "Dog・Cat・Bird の3つを押してみよう。");
  }

  /* ---------- 4. オーバーライド ---------- */
  function override(root) {
    var already = prep(root);
    var ANIMALS = ["Dog", "Cat", "Bird"];
    var CHOICES = { Dog: ["ワン", "ニャー", "ピヨ"], Cat: ["ワン", "ニャー", "ピヨ"], Bird: ["ワン", "ニャー", "ピヨ"] };
    var RIGHT = { Dog: "ワン", Cat: "ニャー", Bird: "ピヨ" };
    var pickd = {};
    root.innerHTML = head("speak() を、それぞれのクラスで書き直す") +
      '<pre class="code">' + hl("abstract class Animal {\n  abstract String speak();   // 中身は子クラスが書く\n}") + "</pre>" +
      '<div class="ov"></div><div class="row"><button type="button" class="btn btn-primary lab-run">全員に speak() を呼ぶ</button></div><div class="cpu-log out" aria-live="polite"></div><p class="lab-status"></p>';
    function draw() {
      root.querySelector(".ov").innerHTML = ANIMALS.map(function (a) {
        return '<div class="ov-row"><pre class="code">' + hl("class " + a + " extends Animal {\n  @Override\n  String speak() { return \"" + (pickd[a] || "？") + "\"; }\n}") + '</pre><div class="ov-ch">' +
          CHOICES[a].map(function (c) { return '<button type="button" class="btn' + (pickd[a] === c ? " btn-primary" : "") + '" data-a="' + a + '" data-c="' + c + '">' + c + "</button>"; }).join("") + "</div></div>";
      }).join("");
      root.querySelectorAll(".ov-ch .btn").forEach(function (b) {
        b.addEventListener("click", function () { pickd[b.getAttribute("data-a")] = b.getAttribute("data-c"); draw(); });
      });
    }
    root.querySelector(".lab-run").addEventListener("click", function () {
      if (!ANIMALS.every(function (a) { return pickd[a]; })) { say(root, "3つとも鳴き声を選んでから呼ぼう。"); return; }
      root.querySelector(".out").innerHTML = ANIMALS.map(function (a) { return "new " + a + "().speak() → 「" + pickd[a] + "」"; }).join("<br>");
      var ok = ANIMALS.every(function (a) { return pickd[a] === RIGHT[a]; });
      if (ok || already) done(root, "同じ speak() という名前でも、どのクラスのインスタンスかによって、そのクラスで書き直した中身が動く。");
      else say(root, "動いたけれど、鳴き声が入れ違っている動物がいる。");
    });
    draw();
    if (already) done(root, "この課題は達成済み"); else say(root, "それぞれの動物に合う鳴き声を選ぼう。");
  }

  /* ---------- 5. ポリモーフィズムとキャスト ---------- */
  function poly(root) {
    var already = prep(root);
    var ZOO = [["Dog", "ポチ", "ワン"], ["Cat", "タマ", "ニャー"], ["Dog", "ハチ", "ワン"], ["Bird", "ピー", "ピヨ"]];
    var did = {};
    root.innerHTML = head("Animal の配列に、いろいろな動物を入れる") +
      '<pre class="code">' + hl("Animal[] zoo = { new Dog(\"ポチ\"), new Cat(\"タマ\"), new Dog(\"ハチ\"), new Bird(\"ピー\") };") + "</pre>" +
      '<div class="row"><button type="button" class="btn btn-primary lab-speak">for (Animal a : zoo) a.speak();</button></div>' +
      '<div class="row"><button type="button" class="btn lab-cast">for (Animal a : zoo) { Dog d = (Dog) a; d.fetch(); }</button></div>' +
      '<div class="row"><button type="button" class="btn lab-safe">for (Animal a : zoo) { if (a instanceof Dog d) d.fetch(); }</button></div>' +
      '<div class="cpu-log out" aria-live="polite"></div><p class="lab-status"></p>';
    function out(h) { root.querySelector(".out").innerHTML = h; }
    function check() { if ((did.speak && did.cast && did.safe) || already) done(root, "変数の型は Animal でも、動くのは中身（実際のインスタンス）のクラスのメソッド。Dog だけの仕事は、instanceof で確かめてから。"); }
    root.querySelector(".lab-speak").addEventListener("click", function () {
      did.speak = true;
      out(ZOO.map(function (z) { return "a は " + z[0] + " のインスタンス → " + z[0] + " の speak() →「" + z[2] + "」"; }).join("<br>"));
      say(root, "同じ1行の a.speak() で、動物ごとに違う鳴き声になった。"); check();
    });
    root.querySelector(".lab-cast").addEventListener("click", function () {
      did.cast = true;
      var lines = [];
      for (var i = 0; i < ZOO.length; i++) {
        if (ZOO[i][0] === "Dog") lines.push(ZOO[i][1] + "（Dog）→ (Dog) に変換できる → ボールを取ってくる");
        else { lines.push('<span class="err">' + ZOO[i][1] + "（" + ZOO[i][0] + "）→ Dog ではないので変換できない。ClassCastException で止まった</span>"); break; }
      }
      out(lines.join("<br>"));
      say(root, "中身が Dog でないものを Dog と思い込んで変換すると、実行中にエラーで止まる。"); check();
    });
    root.querySelector(".lab-safe").addEventListener("click", function () {
      did.safe = true;
      out(ZOO.map(function (z) { return z[1] + "（" + z[0] + "）→ " + (z[0] === "Dog" ? "Dog なので d に入れて fetch()" : "Dog ではないので何もしない"); }).join("<br>"));
      say(root, "instanceof で中身を確かめてから使えば、止まらない。"); check();
    });
    if (already) done(root, "この課題は達成済み"); else say(root, "3つのボタンを順に押してみよう。");
  }

  /* ---------- 6. インターフェース ---------- */
  function iface(root) {
    var already = prep(root);
    var AN = ["Duck", "Penguin", "Eagle", "Cat"];
    var JA = { Duck: "アヒル", Penguin: "ペンギン", Eagle: "ワシ", Cat: "ネコ" };
    var RIGHT = { Duck: { S: 1, F: 1 }, Penguin: { S: 1, F: 0 }, Eagle: { S: 0, F: 1 }, Cat: { S: 0, F: 0 } };
    var st = {}; AN.forEach(function (a) { st[a] = { S: 0, F: 0 }; });
    root.innerHTML = head("できることを interface で付け足す") +
      '<pre class="code">' + hl("interface Swimmer { void swim(); }   // 泳げる\ninterface Flyer   { void fly(); }    // 飛べる") + "</pre>" +
      '<div class="if-grid"></div><div class="row"><button type="button" class="btn btn-primary lab-run">Swimmer を全員集める／Flyer を全員集める</button></div><div class="cpu-log out" aria-live="polite"></div><p class="lab-status"></p>';
    function decl(a) {
      var im = [];
      if (st[a].S) im.push("Swimmer");
      if (st[a].F) im.push("Flyer");
      return "class " + a + " extends " + (a === "Cat" ? "Animal" : "Bird") + (im.length ? " implements " + im.join(", ") : "") + " { … }";
    }
    function draw() {
      root.querySelector(".if-grid").innerHTML = AN.map(function (a) {
        return '<div class="if-row"><span class="if-n">' + JA[a] + '</span><button type="button" class="btn' + (st[a].S ? " btn-primary" : "") + '" data-a="' + a + '" data-k="S">泳げる</button><button type="button" class="btn' + (st[a].F ? " btn-primary" : "") + '" data-a="' + a + '" data-k="F">飛べる</button><code>' + esc(decl(a)) + "</code></div>";
      }).join("");
      root.querySelectorAll(".if-row .btn").forEach(function (b) {
        b.addEventListener("click", function () { var a = b.getAttribute("data-a"), k = b.getAttribute("data-k"); st[a][k] = st[a][k] ? 0 : 1; draw(); });
      });
    }
    root.querySelector(".lab-run").addEventListener("click", function () {
      var sw = AN.filter(function (a) { return st[a].S; }).map(function (a) { return JA[a]; });
      var fl = AN.filter(function (a) { return st[a].F; }).map(function (a) { return JA[a]; });
      root.querySelector(".out").innerHTML = "Swimmer として集めた：" + (sw.join("・") || "（なし）") + "<br>Flyer として集めた：" + (fl.join("・") || "（なし）");
      var ok = AN.every(function (a) { return st[a].S === RIGHT[a].S && st[a].F === RIGHT[a].F; });
      if (ok || already) done(root, "親クラスは1つ（Bird）でも、interface はいくつでも付けられる。アヒルは Swimmer でも Flyer でもある。");
      else say(root, "本物の動物と合っていないところがある。ペンギンは飛べない鳥、ワシは泳がない鳥。");
    });
    draw();
    if (already) done(root, "この課題は達成済み"); else say(root, "本物の動物に合わせて、泳げる・飛べるを付けよう。");
  }

  /* ---------- 7. アクセス修飾子 ---------- */
  function access(root) {
    var already = prep(root);
    var MEM = [["private int hp", 0], ["（何も付けない） int cageNo", 1], ["protected String name", 2], ["public void feed()", 3]];
    var POSN = ["Animal クラスの中", "同じパッケージの別のクラス", "別のパッケージの子クラス（Dog）", "別のパッケージの関係ないクラス"];
    // 可否：[修飾子の強さ][場所]
    var OK = [[1, 0, 0, 0], [1, 1, 0, 0], [1, 1, 1, 0], [1, 1, 1, 1]];
    var st = MEM.map(function () { return [null, null, null, null]; });
    root.innerHTML = head("どこから触れる？（○ か × を選ぶ）") +
      '<div class="acc-wrap"><table class="acc"></table></div><div class="row"><button type="button" class="btn btn-primary lab-check">答え合わせ</button></div><p class="lab-status" aria-live="polite"></p>';
    function draw(showAns) {
      var h = "<tr><th>メンバ ＼ 触る場所</th>" + POSN.map(function (p) { return "<th>" + p + "</th>"; }).join("") + "</tr>";
      MEM.forEach(function (m, i) {
        h += "<tr><th><code>" + esc(m[0]) + "</code></th>";
        for (var j = 0; j < 4; j++) {
          var v = st[i][j], cls = "";
          if (showAns && v !== null) cls = v === OK[i][j] ? "ok" : "ng";
          h += '<td class="' + cls + '"><button type="button" data-i="' + i + '" data-j="' + j + '">' + (v === null ? "?" : v ? "○" : "×") + "</button></td>";
        }
        h += "</tr>";
      });
      root.querySelector(".acc").innerHTML = h;
      root.querySelectorAll(".acc button").forEach(function (b) {
        b.addEventListener("click", function () { var i = +b.getAttribute("data-i"), j = +b.getAttribute("data-j"); st[i][j] = st[i][j] === null ? 1 : st[i][j] ? 0 : 1; draw(false); });
      });
    }
    root.querySelector(".lab-check").addEventListener("click", function () {
      draw(true);
      var right = 0, filled = 0;
      for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) { if (st[i][j] !== null) filled++; if (st[i][j] === OK[i][j]) right++; }
      if (right === 16 || already) done(root, "16マス全部正解！ 下へ行くほど触れる場所が広がる：private ＜ 何も付けない ＜ protected ＜ public。");
      else say(root, "正解 " + right + " / 16（赤いマスを見直そう）。" + (filled < 16 ? "まだ ? のマスがある。" : ""));
    });
    draw(false);
    if (already) { st = OK.map(function (r) { return r.slice(); }); draw(true); done(root, "この課題は達成済み"); } else say(root, "マスを押すたびに ? → ○ → × と変わる。");
  }

  /* ---------- 8. static ---------- */
  function statics(root) {
    var already = prep(root);
    var objs = [], count = 0;
    root.innerHTML = head("インスタンスごとの値と、クラスに1つの値") +
      '<pre class="code">' + hl("class Animal {\n  static int count = 0;   // クラスに1つだけ\n  String name;            // インスタンスごと\n  Animal(String name) {\n    this.name = name;\n    count++;              // 作られるたびに数える\n  }\n}\nclass Dog extends Animal { Dog(String n) { super(n); } }\nclass Cat extends Animal { Cat(String n) { super(n); } }") + "</pre>" +
      '<div class="row"><button type="button" class="btn btn-primary" data-k="Dog">new Dog(…)</button><button type="button" class="btn btn-primary" data-k="Cat">new Cat(…)</button></div>' +
      '<div class="st-wrap"><div class="st-class"><div class="obj-h">Animal クラス（1つだけ）</div>count ＝ <b class="st-c">0</b></div><div class="objs"></div></div><p class="lab-status" aria-live="polite"></p>';
    var NM = { Dog: ["ポチ", "ハチ", "シロ"], Cat: ["タマ", "ミケ", "クロ"] };
    root.querySelectorAll(".row .btn").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-k"), list = objs.filter(function (o) { return o.k === k; });
        var nm = NM[k][list.length % 3];
        objs.push({ k: k, name: nm }); count++;
        root.querySelector(".st-c").textContent = count;
        root.querySelector(".objs").innerHTML = objs.map(function (o) { return '<div class="obj"><div class="obj-h">' + o.k + " のインスタンス</div>name ＝ <b>" + o.name + "</b></div>"; }).join("");
        if (count >= 3 || already) done(root, "name はインスタンスごとに別々。count は Animal クラスに1つだけで、Dog を作っても Cat を作っても同じ count が増える（Animal.count と書いて読む）。");
        else say(root, "インスタンスが " + count + " 個。いろいろ作ってみよう。");
      });
    });
    if (already) done(root, "この課題は達成済み"); else say(root, "Dog と Cat を合わせて3匹作ってみよう。");
  }

  /* ---------- 9. UML の矢印 ---------- */
  function uml(root) {
    var already = prep(root);
    var KINDS = ["継承", "実装", "関連", "集約", "コンポジション"];
    var Q = [
      ["Dog は Animal の一種", 0],
      ["Duck は Swimmer（泳げる）という約束を果たす", 1],
      ["飼育係（Keeper）は担当の動物（Animal）を知っている", 2],
      ["動物園（Zoo）は動物（Animal）を集めている。動物は別の動物園に移ることもある", 3],
      ["動物（Animal）は自分の健康記録（HealthRecord）を持つ。記録はその動物とともに作られ、ともに消える", 4]
    ];
    var ans = Q.map(function () { return null; });
    var ARROW = [
      '<svg viewBox="0 0 120 24" width="120"><line x1="4" y1="12" x2="100" y2="12" stroke="#333" stroke-width="2"/><path d="M100,4 L116,12 L100,20 z" fill="#fff" stroke="#333" stroke-width="2"/></svg>',
      '<svg viewBox="0 0 120 24" width="120"><line x1="4" y1="12" x2="100" y2="12" stroke="#333" stroke-width="2" stroke-dasharray="6 4"/><path d="M100,4 L116,12 L100,20 z" fill="#fff" stroke="#333" stroke-width="2"/></svg>',
      '<svg viewBox="0 0 120 24" width="120"><line x1="4" y1="12" x2="114" y2="12" stroke="#333" stroke-width="2"/><path d="M104,6 L116,12 L104,18" fill="none" stroke="#333" stroke-width="2"/></svg>',
      '<svg viewBox="0 0 120 24" width="120"><path d="M4,12 L14,6 L24,12 L14,18 z" fill="#fff" stroke="#333" stroke-width="2"/><line x1="24" y1="12" x2="116" y2="12" stroke="#333" stroke-width="2"/></svg>',
      '<svg viewBox="0 0 120 24" width="120"><path d="M4,12 L14,6 L24,12 L14,18 z" fill="#333" stroke="#333" stroke-width="2"/><line x1="24" y1="12" x2="116" y2="12" stroke="#333" stroke-width="2"/></svg>'
    ];
    root.innerHTML = head("どの線でつなぐ？") +
      '<div class="uml-legend">' + KINDS.map(function (k, i) { return '<div class="ul"><b>' + k + "</b>" + ARROW[i] + "</div>"; }).join("") + "</div>" +
      '<div class="uml-q"></div><p class="lab-status" aria-live="polite"></p>';
    function draw() {
      root.querySelector(".uml-q").innerHTML = Q.map(function (q, i) {
        return '<div class="uq' + (ans[i] === null ? "" : ans[i] === q[1] ? " ok" : " ng") + '"><span>' + q[0] + '</span><div class="uq-b">' + KINDS.map(function (k, j) {
          return '<button type="button" class="btn' + (ans[i] === j ? " btn-primary" : "") + '" data-i="' + i + '" data-j="' + j + '">' + k + "</button>";
        }).join("") + "</div></div>";
      }).join("");
      root.querySelectorAll(".uq-b .btn").forEach(function (b) {
        b.addEventListener("click", function () { ans[+b.getAttribute("data-i")] = +b.getAttribute("data-j"); draw(); check(); });
      });
    }
    function check() {
      var right = Q.filter(function (q, i) { return ans[i] === q[1]; }).length;
      if (right === Q.length || already) done(root, "5問とも正解！");
      else say(root, "正解 " + right + " / " + Q.length);
    }
    if (already) ans = Q.map(function (q) { return q[1]; });
    draw(); check();
  }

  /* ---------- 10. 設計の判断 ---------- */
  function design(root) {
    var already = prep(root);
    var Q = [
      { q: "ペンギン（Penguin）を Bird の子クラスにしたい。でも Bird には fly()（飛ぶ）がある。どうする？", c: ["Penguin で fly() をオーバーライドして、呼ばれたらエラーを出す", "Bird から fly() を外し、飛べる鳥だけが Flyer という interface を実装する", "Penguin を Bird の子クラスにするのをやめて、Fish の子クラスにする"], a: 1, e: "「Bird なら必ず飛べる」と約束しておきながら Penguin が破ると、Bird として扱うコードが壊れる。できることは interface で付け足すほうが安全。" },
      { q: "動物の「鳴き声を出す機能」を、ロボット犬（RoboDog）にも使いたい。RoboDog は動物ではない。", c: ["RoboDog を Animal の子クラスにする", "鳴き声を出す部品（Voice クラス）を作り、Animal も RoboDog もその部品を持つ（合成）", "Animal の鳴き声のコードを RoboDog にコピーする"], a: 1, e: "is-a（〜の一種）が成り立たないのに継承すると、関係ない機能まで受け継ぐ。部品として持たせる（has-a）方が柔軟。「継承より合成」とよく言われる。" },
      { q: "動物の体重 weight を、だれでも書き換えられる public にしていたら、マイナスの体重が入るバグが出た。どうする？", c: ["weight を private にし、0 より大きいかを確かめる setWeight() からだけ書き換えられるようにする", "体重を使う側で、毎回マイナスでないか確かめる", "weight を static にする"], a: 0, e: "正しさを守る確認は、データを持つクラス自身が1か所で行う。これがカプセル化の目的。" }
    ];
    var ans = Q.map(function () { return null; });
    root.innerHTML = head("設計の判断") + '<div class="dz"></div><p class="lab-status" aria-live="polite"></p>';
    function draw() {
      root.querySelector(".dz").innerHTML = Q.map(function (q, i) {
        return '<div class="dq"><p><b>' + (i + 1) + ".</b> " + q.q + "</p>" + q.c.map(function (c, j) {
          var cls = ans[i] === j ? (j === q.a ? " choice-ok" : " choice-ng") : "";
          return '<button type="button" class="choice-btn' + cls + '" data-i="' + i + '" data-j="' + j + '">' + c + "</button>";
        }).join("") + (ans[i] === q.a ? '<p class="dq-e">' + q.e + "</p>" : "") + "</div>";
      }).join("");
      root.querySelectorAll(".dq .choice-btn").forEach(function (b) {
        b.addEventListener("click", function () { ans[+b.getAttribute("data-i")] = +b.getAttribute("data-j"); draw(); check(); });
      });
    }
    function check() {
      var right = Q.filter(function (q, i) { return ans[i] === q.a; }).length;
      if (right === Q.length || already) done(root, "3つとも良い設計を選べた。");
      else say(root, "良い設計 " + right + " / " + Q.length);
    }
    if (already) ans = Q.map(function (q) { return q.a; });
    draw(); check();
  }

  var KINDS = { dup: dup, instances: instances, inherit: inherit, override: override, poly: poly, iface: iface, access: access, statics: statics, uml: uml, design: design };
  function boot() {
    document.querySelectorAll(".lab[data-lab]").forEach(function (root) {
      var f = KINDS[root.getAttribute("data-lab")];
      if (f) f(root);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window);

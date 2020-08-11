# rehype-shiki

[**rehype**][rehype] plugin to apply syntax highlighting on code blocks with [**shiki**][shiki].

This plugin was based upon [**rehype-highlight**][rehype-highlight].

## Installation

[npm][]:

```bash
npm install rehype-shiki
```

## Usage

Say `example.html` looks as follows:

...and `example.js` like this:

```javascript
var vfile = require('to-vfile')
var report = require('vfile-reporter')
var rehype = require('rehype')
var shiki = require('rehype-shiki')

rehype()
  .data('settings', {fragment: true})
  .use(shiki)
  .process(vfile.readSync('example.html'), function(err, file) {
    console.error(report(err || file))
    console.log(String(file))
  })
```

Now, running `node example` yields:

## API

### `rehype().use(shiki[, options])`

Apply syntax highlighting to `pre > code` using [**shiki**][shiki]; which tokenises the code block and new [**hast**][hast] nodes are subsequently created from (using this plugin).

Configure the language by using the `language-foo` class on the `code` element.  For example;

```html
<pre><code class="language-js">console.log("Hello world!")</code></pre>
```

This is in respect to the [mdast-util-to-hast code handler](https://github.com/syntax-tree/mdast-util-to-hast/blob/master/lib/handlers/code.js).

[Shiki][shiki] does not perform language detection, if unknown, this plugin falls back to the theme's background and text colour (chosen as `settings.foreground` from the theme file).

#### `options`

##### `options.theme`

`string`, default: `'nord'` - Name of shiki theme to use, otherwise path to theme file for it to load.

##### `options.useBackground`

`boolean`, default: `true` - Whether to apply the background theme colour to the `pre` element.

## License

[MIT][license] © [@rsclarke][rsclarke]

<!-- Definitions -->

[rehype]: https://github.com/rehypejs/rehype
[shiki]: https://github.com/octref/shiki
[rehype-highlight]: https://github.com/rehypejs/rehype-highlight
[npm]: https://docs.npmjs.com/cli/install
[hast]: https://github.com/syntax-tree/hast
[license]: LICENSE
[rsclarke]: https://rsclarke.dev

```cpp
#include <cstdio>
const int N = 100005;
int rt, tot, fa[N], ch[N][2], val[N], cnt[N], sz[N];
struct Splay {
  void maintain(int x) { sz[x] = sz[ch[x][0]] + sz[ch[x][1]] + cnt[x]; }
  bool get(int x) { return x == ch[fa[x]][1]; }
  void clear(int x) {
    ch[x][0] = ch[x][1] = fa[x] = val[x] = sz[x] = cnt[x] = 0;
  }
  void rotate(int x) {
    int y = fa[x], z = fa[y], chk = get(x);
    ch[y][chk] = ch[x][chk ^ 1];
    fa[ch[x][chk ^ 1]] = y;
    ch[x][chk ^ 1] = y;
    fa[y] = x;
    fa[x] = z;
    if (z) ch[z][y == ch[z][1]] = x;
    maintain(x);
    maintain(y);
  }
  void splay(int x) {
    for (int f = fa[x]; f = fa[x], f; rotate(x))
      if (fa[f]) rotate(get(x) == get(f) ? f : x);
    rt = x;
  }
  void ins(int k) {
    if (!rt) {
      val[++tot] = k;
      cnt[tot]++;
      rt = tot;
      maintain(rt);
      return;
    }
    int cnr = rt, f = 0;
    while (1) {
      if (val[cnr] == k) {
        cnt[cnr]++;
        maintain(cnr);
        maintain(f);
        splay(cnr);
        break;
      }
      f = cnr;
      cnr = ch[cnr][val[cnr] < k];
      if (!cnr) {
        val[++tot] = k;
        cnt[tot]++;
        fa[tot] = f;
        ch[f][val[f] < k] = tot;
        maintain(tot);
        maintain(f);
        splay(tot);
        break;
      }
    }
  }
  int rk(int k) {
    int res = 0, cnr = rt;
    while (1) {
      if (k < val[cnr]) {
        cnr = ch[cnr][0];
      } else {
        res += sz[ch[cnr][0]];
        if (k == val[cnr]) {
          splay(cnr);
          return res + 1;
        }
        res += cnt[cnr];
        cnr = ch[cnr][1];
      }
    }
  }
  int kth(int k) {
    int cnr = rt;
    while (1) {
      if (ch[cnr][0] && k <= sz[ch[cnr][0]]) {
        cnr = ch[cnr][0];
      } else {
        k -= cnt[cnr] + sz[ch[cnr][0]];
        if (k <= 0) {
          splay(cnr);
          return val[cnr];
        }
        cnr = ch[cnr][1];
      }
    }
  }
  int pre() {
    int cnr = ch[rt][0];
    while (ch[cnr][1]) cnr = ch[cnr][1];
    splay(cnr);
    return cnr;
  }
  int nxt() {
    int cnr = ch[rt][1];
    while (ch[cnr][0]) cnr = ch[cnr][0];
    splay(cnr);
    return cnr;
  }
  void del(int k) {
    rk(k);
    if (cnt[rt] > 1) {
      cnt[rt]--;
      maintain(rt);
      return;
    }
    if (!ch[rt][0] && !ch[rt][1]) {
      clear(rt);
      rt = 0;
      return;
    }
    if (!ch[rt][0]) {
      int cnr = rt;
      rt = ch[rt][1];
      fa[rt] = 0;
      clear(cnr);
      return;
    }
    if (!ch[rt][1]) {
      int cnr = rt;
      rt = ch[rt][0];
      fa[rt] = 0;
      clear(cnr);
      return;
    }
    int cnr = rt;
    int x = pre();
    splay(x);
    fa[ch[cnr][1]] = x;
    ch[x][1] = ch[cnr][1];
    clear(cnr);
    maintain(rt);
  }
} tree;

int main() {
  int n, opt, x;
  for (scanf("%d", &n); n; --n) {
    scanf("%d%d", &opt, &x);
    if (opt == 1)
      tree.ins(x);
    else if (opt == 2)
      tree.del(x);
    else if (opt == 3)
      printf("%d\n", tree.rk(x));
    else if (opt == 4)
      printf("%d\n", tree.kth(x));
    else if (opt == 5)
      tree.ins(x), printf("%d\n", val[tree.pre()]), tree.del(x);
    else
      tree.ins(x), printf("%d\n", val[tree.nxt()]), tree.del(x);
  }
  return 0;
}
```

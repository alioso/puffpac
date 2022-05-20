// Modernizr 2.0.6 (Custom Build) | MIT & BSD
//  * Build: http://www.modernizr.com/download/#-touch-teststyles-prefixes
//  */
window.Modernizr = (function (a, b, c) {
  function y(a, b) {
    return !!~("" + a).indexOf(b)
  }
  function x(a, b) {
    return typeof a === b
  }
  function w(a, b) {
    return v(m.join(a + ";") + (b || ""))
  }
  function v(a) {
    j.cssText = a
  }
  var d = "2.0.6",
    e = {},
    f = b.documentElement,
    g = b.head || b.getElementsByTagName("head")[0],
    h = "modernizr",
    i = b.createElement(h),
    j = i.style,
    k,
    l = Object.prototype.toString,
    m = " -webkit- -moz- -o- -ms- -khtml- ".split(" "),
    n = {},
    o = {},
    p = {},
    q = [],
    r = function (a, c, d, e) {
      var g,
        i,
        j,
        k = b.createElement("div")
      if (parseInt(d, 10))
        while (d--)
          (j = b.createElement("div")),
            (j.id = e ? e[d] : h + (d + 1)),
            k.appendChild(j)
      ;(g = ["&shy;", "<style>", a, "</style>"].join("")),
        (k.id = h),
        (k.innerHTML += g),
        f.appendChild(k),
        (i = c(k, a)),
        k.parentNode.removeChild(k)
      return !!i
    },
    s,
    t = {}.hasOwnProperty,
    u
  !x(t, c) && !x(t.call, c)
    ? (u = function (a, b) {
        return t.call(a, b)
      })
    : (u = function (a, b) {
        return b in a && x(a.constructor.prototype[b], c)
      })
  var z = (function (c, d) {
    var f = c.join(""),
      g = d.length
    r(
      f,
      function (c, d) {
        var f = b.styleSheets[b.styleSheets.length - 1],
          h =
            f.cssRules && f.cssRules[0]
              ? f.cssRules[0].cssText
              : f.cssText || "",
          i = c.childNodes,
          j = {}
        while (g--) j[i[g].id] = i[g]
        e.touch = "ontouchstart" in a || j.touch.offsetTop === 9
      },
      g,
      d
    )
  })(
    [
      ,
      [
        "@media (",
        m.join("touch-enabled),("),
        h,
        ")",
        "{#touch{top:9px;position:absolute}}"
      ].join("")
    ],
    [, "touch"]
  )
  n.touch = function () {
    return e.touch
  }
  for (var A in n)
    u(n, A) &&
      ((s = A.toLowerCase()), (e[s] = n[A]()), q.push((e[s] ? "" : "no-") + s))
  v(""), (i = k = null), (e._version = d), (e._prefixes = m), (e.testStyles = r)
  return e
})(this, this.document)

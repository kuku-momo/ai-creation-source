import {
  _ as K,
  o as T,
  b as l,
  e as t,
  v as w,
  z as j,
  H as M,
  t as o,
  j as k,
  J as N,
  F as f,
  r as _,
  l as d,
  G as x,
  m as i,
  p as V,
  g as D,
} from "./index-Z8pMLIar.js";
const I = { class: "card", style: { padding: "24px", "max-width": "720px" } },
  O = { class: "field" },
  P = { class: "field" },
  U = { style: { display: "flex", gap: "10px" } },
  A = ["type", "placeholder"],
  J = { key: 0, class: "muted", style: { "font-size": "12px" } },
  L = {
    style: {
      display: "flex",
      gap: "12px",
      "margin-top": "8px",
      "align-items": "center",
    },
  },
  F = ["disabled"],
  R = {
    key: 0,
    style: {
      color: "var(--ok,#34d399)",
      "font-size": "13px",
      "margin-top": "10px",
    },
  },
  $ = { class: "page-head", style: { "margin-top": "34px" } },
  E = { class: "muted" },
  G = { class: "tabs", style: { margin: "14px 0" } },
  H = ["onClick"],
  q = { class: "badge" },
  Q = { class: "grid grid-2" },
  W = { class: "model-name" },
  X = { class: "model-id" },
  Y = { class: "model-tags" },
  Z = {
    __name: "Settings",
    setup(ee) {
      const n = d(""),
        c = d("https://api.lk888.ai"),
        r = d(""),
        p = d(!1),
        y = d(!1),
        m = d(!1),
        u = d(null),
        g = d("chat"),
        v = d({ chat: [], image: [], video: [] }),
        b = x(() => [
          { key: "chat", label: "文本模型", list: v.value.chat },
          { key: "image", label: "图片模型", list: v.value.image },
          { key: "video", label: "视频模型", list: v.value.video },
        ]),
        S = x(() => {
          var s;
          return (
            ((s = b.value.find((e) => e.key === g.value)) == null
              ? void 0
              : s.list) || []
          );
        }),
        C = x(
          () =>
            v.value.chat.length + v.value.image.length + v.value.video.length,
        );
      T(async () => {
        try {
          const e = await (await fetch("/api/settings")).json();
          (c.value = e.apiBase || "https://api.lk888.ai"),
            (r.value = e.apiKeyMasked || ""),
            (v.value = e.models || { chat: [], image: [], video: [] }),
            (u.value = e.testResult);
        } catch {}
      });
      async function B() {
        y.value = !1;
        const s = { apiBase: c.value };
        n.value.trim() && (s.apiKey = n.value.trim());
        const e = await fetch("/api/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(s),
          }),
          a = await e.json().catch(() => ({}));
        if (!e.ok || !a.ok) return alert(a.msg || "保存失败");
        (y.value = !0),
          setTimeout(() => (y.value = !1), 2500),
          n.value &&
            (r.value = n.value.slice(0, 6) + "****" + n.value.slice(-4)),
          (n.value = "");
      }
      async function z() {
        (m.value = !0), (u.value = null);
        try {
          const s = await fetch("/api/settings/test", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apiKey: n.value, apiBase: c.value }),
          });
          u.value = await s.json();
        } catch (s) {
          u.value = { ok: !1, error: s.message };
        }
        m.value = !1;
      }
      return (s, e) => (
        i(),
        l("div", null, [
          e[7] ||
            (e[7] = t(
              "div",
              { class: "page-head" },
              [
                t("h2", null, "大模型设置"),
                t("div", { class: "muted" }, "模型服务与连接配置"),
              ],
              -1,
            )),
          t("div", I, [
            t("div", O, [
              e[3] || (e[3] = t("label", null, "API 地址（Base URL）", -1)),
              w(
                t(
                  "input",
                  {
                    "onUpdate:modelValue":
                      e[0] || (e[0] = (a) => (c.value = a)),
                    placeholder: "https://api.lk888.ai",
                  },
                  null,
                  512,
                ),
                [[j, c.value]],
              ),
              e[4] ||
                (e[4] = t(
                  "div",
                  { class: "muted", style: { "font-size": "12px" } },
                  "默认已对接梦颜AI中转站，一般无需修改",
                  -1,
                )),
            ]),
            t("div", P, [
              e[5] || (e[5] = t("label", null, "API Key", -1)),
              t("div", U, [
                w(
                  t(
                    "input",
                    {
                      "onUpdate:modelValue":
                        e[1] || (e[1] = (a) => (n.value = a)),
                      autocomplete: "new-password",
                      type: p.value ? "text" : "password",
                      placeholder: r.value
                        ? "已保存，留空则不修改"
                        : "sk-xxxxxxxx",
                    },
                    null,
                    8,
                    A,
                  ),
                  [[M, n.value]],
                ),
                t(
                  "button",
                  {
                    class: "btn-plain",
                    style: { "white-space": "nowrap" },
                    onClick: e[2] || (e[2] = (a) => (p.value = !p.value)),
                  },
                  o(p.value ? "隐藏" : "显示"),
                  1,
                ),
              ]),
              r.value
                ? (i(), l("div", J, "当前已保存：" + o(r.value), 1))
                : k("", !0),
            ]),
            t("div", L, [
              t("button", { class: "btn", onClick: B }, "保存配置"),
              t(
                "button",
                { class: "btn-plain", onClick: z, disabled: m.value },
                o(m.value ? "测试中..." : "测试连接"),
                9,
                F,
              ),
              u.value
                ? (i(),
                  l(
                    "span",
                    {
                      key: 0,
                      style: N({
                        color: u.value.ok ? "var(--ok,#34d399)" : "#f87171",
                        fontSize: 13,
                      }),
                    },
                    o(
                      u.value.ok
                        ? "✅ 连接成功，Key 有效"
                        : "❌ " + u.value.error,
                    ),
                    5,
                  ))
                : k("", !0),
            ]),
            y.value ? (i(), l("div", R, "✅ 已保存")) : k("", !0),
          ]),
          e[8] ||
            (e[8] = t(
              "p",
              { class: "muted storage-note" },
              "素材上传存储由平台后台统一管理，用户无需填写 OSS 配置。上传不可用时请联系管理员。",
              -1,
            )),
          t("div", $, [
            e[6] || (e[6] = t("h3", null, "已对接模型清单", -1)),
            t("div", E, "共 " + o(C.value) + " 个", 1),
          ]),
          t("div", G, [
            (i(!0),
            l(
              f,
              null,
              _(
                b.value,
                (a) => (
                  i(),
                  l(
                    "button",
                    {
                      key: a.key,
                      class: V(["tab", { active: g.value === a.key }]),
                      onClick: (h) => (g.value = a.key),
                    },
                    [D(o(a.label) + " ", 1), t("span", q, o(a.list.length), 1)],
                    10,
                    H,
                  )
                ),
              ),
              128,
            )),
          ]),
          t("div", Q, [
            (i(!0),
            l(
              f,
              null,
              _(
                S.value,
                (a) => (
                  i(),
                  l("div", { key: a.id, class: "card model-item" }, [
                    t("div", W, o(a.name), 1),
                    t("div", X, o(a.id), 1),
                    t("div", Y, [
                      (i(!0),
                      l(
                        f,
                        null,
                        _(
                          a.tags,
                          (h) => (
                            i(), l("span", { key: h, class: "tag" }, o(h), 1)
                          ),
                        ),
                        128,
                      )),
                    ]),
                  ])
                ),
              ),
              128,
            )),
          ]),
        ])
      );
    },
  },
  ae = K(Z, [["__scopeId", "data-v-004ba4af"]]);
export { ae as default };

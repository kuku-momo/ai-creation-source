import {
  c as M,
  _ as P,
  o as S,
  a as j,
  b as d,
  e as t,
  d as k,
  g as f,
  f as c,
  u as o,
  t as g,
  j as _,
  h as A,
  p as W,
  l as r,
  G as H,
  m as n,
} from "./index-Z8pMLIar.js";
import { A as T } from "./arrow-up-right-BCjJ20qW.js";
import { L } from "./loader-circle-D8DmJQ5i.js";
import { R as U } from "./refresh-cw-C3tpVxsU.js";
import { D as X } from "./download-BwIkmfjC.js";
import { C as Y } from "./check-cXlZY8Kx.js";
import { C as G } from "./copy-U2ZmXKm8.js";
import { X as O } from "./x-DUmRXFcP.js";
/**
 * @license @lucide/vue v1.47.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ const $ = {
    name: "message-circle",
    size: 24,
    node: [
      [
        "path",
        {
          d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",
          key: "1sd12s",
        },
      ],
    ],
  },
  I = M($),
  q = "/assets/agency-partner-poster-0Vq4s83o.jpg",
  F = { class: "agency-page" },
  J = { class: "partner-banner", "aria-labelledby": "partner-title" },
  K = { class: "partner-copy" },
  Q = ["disabled"],
  Z = { class: "partner-visual" },
  aa = ["src"],
  ta = { class: "poster-zoom", "aria-hidden": "true" },
  ea = { key: 0, class: "contact-feedback", role: "status" },
  sa = { key: 1, class: "contact-feedback contact-error", role: "alert" },
  oa = { key: 2, class: "contact-layout" },
  la = { class: "qr-column" },
  na = { class: "qr-frame" },
  ia = ["src"],
  da = { key: 1, class: "qr-fallback" },
  ra = ["href", "download"],
  ca = { class: "contact-details" },
  ua = { class: "wechat-row" },
  va = { class: "wechat-value" },
  pa = ["disabled"],
  fa = ["role"],
  ma = { class: "service-note" },
  ga = { key: 0 },
  ya = { key: 3, class: "contact-feedback" },
  ba = { class: "poster-dialog-content" },
  ha = ["src"],
  wa = {
    __name: "Agency",
    setup(ka) {
      const E = r(null),
        x = r(null),
        u = r(null),
        s = r(null),
        y = r(!1),
        b = r(""),
        h = r(!1),
        m = r(!1),
        v = r(""),
        p = r(!1);
      let i,
        w = !1;
      const B = H(() => {
        var a;
        const e = ((a = s.value) == null ? void 0 : a.qrImage) || "";
        return e.startsWith("data:image/jpeg;")
          ? "代理客服二维码.jpg"
          : e.startsWith("data:image/webp;")
            ? "代理客服二维码.webp"
            : "代理客服二维码.png";
      });
      function N() {
        const e = E.value;
        e &&
          (e.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "instant"
              : "smooth",
            block: "start",
          }),
          window.setTimeout(
            () => (x.value || e).focus({ preventScroll: !0 }),
            350,
          ));
      }
      function V() {
        var e;
        (e = u.value) == null || e.showModal();
      }
      function R(e) {
        if (e.target !== u.value) return;
        const a = u.value.getBoundingClientRect();
        (e.clientX < a.left ||
          e.clientX > a.right ||
          e.clientY < a.top ||
          e.clientY > a.bottom) &&
          u.value.close();
      }
      async function z() {
        i == null || i.abort();
        const e = new AbortController();
        i = e;
        const a = window.setTimeout(() => e.abort(), 1e4);
        (y.value = !0), (b.value = ""), (h.value = !1);
        try {
          const l = await fetch("/api/site/card-claim", {
              cache: "no-store",
              signal: e.signal,
            }),
            C = await l.json().catch(() => ({}));
          if (!l.ok || !C.ok) throw new Error(C.msg || "客服信息加载失败");
          !w && i === e && (s.value = C.config);
        } catch (l) {
          !w &&
            i === e &&
            (b.value =
              l.name === "AbortError"
                ? "连接超时，请重新加载。"
                : "客服信息暂时无法加载，请重新加载。");
        } finally {
          window.clearTimeout(a), !w && i === e && (y.value = !1);
        }
      }
      async function D() {
        var e, a;
        if (!(m.value || !((e = s.value) != null && e.wechat))) {
          (m.value = !0), (v.value = ""), (p.value = !1);
          try {
            try {
              if (!((a = navigator.clipboard) != null && a.writeText))
                throw new Error("clipboard unavailable");
              await navigator.clipboard.writeText(s.value.wechat);
            } catch {
              const l = document.createElement("textarea");
              (l.value = s.value.wechat),
                (l.style.cssText =
                  "position:fixed;opacity:0;width:1px;height:1px;"),
                document.body.appendChild(l);
              try {
                if ((l.select(), !document.execCommand("copy")))
                  throw new Error("copy failed");
              } finally {
                l.remove();
              }
            }
            v.value = "微信号已复制，打开微信搜索并添加客服。";
          } catch {
            (p.value = !0), (v.value = "自动复制失败，请手动选择微信号复制。");
          } finally {
            m.value = !1;
          }
        }
      }
      return (
        S(z),
        j(() => {
          var e;
          (w = !0), i == null || i.abort(), (e = u.value) == null || e.close();
        }),
        (e, a) => (
          n(),
          d("main", F, [
            a[21] ||
              (a[21] = t(
                "header",
                { class: "page-heading" },
                [
                  t("div", null, [
                    t("span", { class: "eyebrow" }, "PARTNER WITH US"),
                    t("h1", null, "代理加盟"),
                  ]),
                  t("p", null, "让好工具被更多人看见，让合作从这里开始。"),
                ],
                -1,
              )),
            t("section", J, [
              t("div", K, [
                a[3] ||
                  (a[3] = k(
                    '<span class="partner-invitation" data-v-9546d4af><span aria-hidden="true" data-v-9546d4af></span>AI 创作 · 合作伙伴招募</span><h2 id="partner-title" data-v-9546d4af>把 AI 创作力<br data-v-9546d4af><em data-v-9546d4af>变成合作新机会</em></h2><p class="partner-description" data-v-9546d4af>从体验好工具，到分享新价值。无论你有推广渠道、社群资源，还是刚开始了解 AI 创作，都欢迎和我们聊聊。</p><div class="partner-topics" aria-label="合作方向" data-v-9546d4af><span data-v-9546d4af>AI 短剧创作</span><span data-v-9546d4af>内容推广</span><span data-v-9546d4af>代理合作</span></div>',
                    4,
                  )),
                t(
                  "button",
                  {
                    type: "button",
                    class: "partner-cta",
                    disabled: y.value,
                    onClick: N,
                  },
                  [
                    a[2] || (a[2] = f(" 联系代理客服", -1)),
                    c(o(T), { size: 18, "aria-hidden": "true" }),
                  ],
                  8,
                  Q,
                ),
                a[4] ||
                  (a[4] = k(
                    '<p class="partner-cta-note" data-v-9546d4af>扫码添加客服，咨询代理模式与合作细节</p><ol class="partner-steps" aria-label="加盟咨询流程" data-v-9546d4af><li data-v-9546d4af><span data-v-9546d4af>01</span><div data-v-9546d4af><strong data-v-9546d4af>添加客服</strong><small data-v-9546d4af>扫码或搜索微信</small></div></li><li data-v-9546d4af><span data-v-9546d4af>02</span><div data-v-9546d4af><strong data-v-9546d4af>沟通方向</strong><small data-v-9546d4af>说明资源与合作想法</small></div></li><li data-v-9546d4af><span data-v-9546d4af>03</span><div data-v-9546d4af><strong data-v-9546d4af>确认合作</strong><small data-v-9546d4af>了解方案与具体事项</small></div></li></ol>',
                    2,
                  )),
              ]),
              t("figure", Z, [
                t(
                  "button",
                  {
                    type: "button",
                    class: "poster-preview",
                    "aria-label": "查看代理加盟宣传海报大图",
                    onClick: V,
                  },
                  [
                    t(
                      "img",
                      {
                        src: o(q),
                        width: "1254",
                        height: "1254",
                        alt: "代理加盟宣传海报，展示 AI 创作学习、推广与学员交流案例",
                        fetchpriority: "high",
                        decoding: "async",
                      },
                      null,
                      8,
                      aa,
                    ),
                    t("span", ta, [
                      a[5] || (a[5] = f("查看完整海报 ", -1)),
                      c(o(T), { size: 13 }),
                    ]),
                  ],
                ),
                a[6] ||
                  (a[6] = t(
                    "figcaption",
                    null,
                    "海报案例仅供参考，不构成收益承诺；实际效果因个人投入与经营情况而异。",
                    -1,
                  )),
              ]),
            ]),
            t(
              "section",
              {
                id: "agency-contact",
                ref_key: "contactPanel",
                ref: E,
                class: "contact-panel",
                "aria-labelledby": "contact-title",
                tabindex: "-1",
              },
              [
                a[19] ||
                  (a[19] = k(
                    '<div class="contact-heading" data-v-9546d4af><div data-v-9546d4af><span class="eyebrow" data-v-9546d4af>CONTACT SERVICE</span><h2 id="contact-title" data-v-9546d4af>联系代理客服</h2><p data-v-9546d4af>添加客服微信，发送“代理加盟”，了解合作方式与具体方案。</p></div><span class="contact-status" data-v-9546d4af><span aria-hidden="true" data-v-9546d4af></span>一对一咨询</span></div>',
                    1,
                  )),
                y.value
                  ? (n(),
                    d("div", ea, [
                      c(o(L), {
                        size: 24,
                        class: "spin",
                        "aria-hidden": "true",
                      }),
                      a[7] || (a[7] = t("span", null, "正在加载客服信息…", -1)),
                    ]))
                  : b.value
                    ? (n(),
                      d("div", sa, [
                        t("p", null, g(b.value), 1),
                        t(
                          "button",
                          {
                            type: "button",
                            class: "icon-command",
                            title: "重新加载",
                            "aria-label": "重新加载客服信息",
                            onClick: z,
                          },
                          [c(o(U), { size: 18, "aria-hidden": "true" })],
                        ),
                      ]))
                    : s.value
                      ? (n(),
                        d("div", oa, [
                          t("div", la, [
                            t("div", na, [
                              s.value.qrImage && !h.value
                                ? (n(),
                                  d(
                                    "img",
                                    {
                                      key: 0,
                                      src: s.value.qrImage,
                                      alt: "代理客服微信二维码",
                                      onError:
                                        a[0] || (a[0] = (l) => (h.value = !0)),
                                    },
                                    null,
                                    40,
                                    ia,
                                  ))
                                : (n(),
                                  d("div", da, [
                                    c(o(I), {
                                      size: 38,
                                      "aria-hidden": "true",
                                    }),
                                    a[8] ||
                                      (a[8] = t(
                                        "span",
                                        null,
                                        "二维码暂时无法显示",
                                        -1,
                                      )),
                                  ])),
                            ]),
                            a[10] ||
                              (a[10] = t(
                                "p",
                                null,
                                "打开微信扫一扫，添加代理客服",
                                -1,
                              )),
                            s.value.qrImage && !h.value
                              ? (n(),
                                d(
                                  "a",
                                  {
                                    key: 0,
                                    class: "save-qr",
                                    href: s.value.qrImage,
                                    download: B.value,
                                  },
                                  [
                                    c(o(X), {
                                      size: 15,
                                      "aria-hidden": "true",
                                    }),
                                    a[9] || (a[9] = f("保存二维码 ", -1)),
                                  ],
                                  8,
                                  ra,
                                ))
                              : _("", !0),
                          ]),
                          t("div", ca, [
                            a[14] ||
                              (a[14] = t(
                                "span",
                                { class: "service-label" },
                                "AGENCY SERVICE",
                                -1,
                              )),
                            a[15] ||
                              (a[15] = t(
                                "h3",
                                null,
                                "添加客服，聊聊你的合作想法",
                                -1,
                              )),
                            a[16] ||
                              (a[16] = t(
                                "p",
                                { class: "service-copy" },
                                "无论你已有成熟渠道，还是刚开始了解代理合作，都可以先与客服沟通。添加后请备注“代理加盟”。",
                                -1,
                              )),
                            t("div", ua, [
                              t("div", va, [
                                c(o(I), { size: 20, "aria-hidden": "true" }),
                                t("div", null, [
                                  a[11] ||
                                    (a[11] = t("span", null, "客服微信", -1)),
                                  t("strong", null, g(s.value.wechat), 1),
                                ]),
                              ]),
                              t(
                                "button",
                                {
                                  ref_key: "copyButton",
                                  ref: x,
                                  type: "button",
                                  class: "copy-button",
                                  disabled: m.value,
                                  onClick: D,
                                },
                                [
                                  v.value && !p.value
                                    ? (n(),
                                      A(o(Y), {
                                        key: 0,
                                        size: 16,
                                        "aria-hidden": "true",
                                      }))
                                    : (n(),
                                      A(o(G), {
                                        key: 1,
                                        size: 16,
                                        "aria-hidden": "true",
                                      })),
                                  f(
                                    " " +
                                      g(
                                        m.value
                                          ? "复制中…"
                                          : v.value && !p.value
                                            ? "已复制"
                                            : "复制微信号",
                                      ),
                                    1,
                                  ),
                                ],
                                8,
                                pa,
                              ),
                            ]),
                            v.value
                              ? (n(),
                                d(
                                  "p",
                                  {
                                    key: 0,
                                    class: W([
                                      "copy-result",
                                      { error: p.value },
                                    ]),
                                    role: p.value ? "alert" : "status",
                                  },
                                  g(v.value),
                                  11,
                                  fa,
                                ))
                              : _("", !0),
                            a[17] ||
                              (a[17] = k(
                                '<ol class="contact-steps" aria-label="联系代理客服步骤" data-v-9546d4af><li data-v-9546d4af><span data-v-9546d4af>1</span><div data-v-9546d4af><strong data-v-9546d4af>扫码或搜索</strong><small data-v-9546d4af>添加上方客服微信</small></div></li><li data-v-9546d4af><span data-v-9546d4af>2</span><div data-v-9546d4af><strong data-v-9546d4af>发送加盟信息</strong><small data-v-9546d4af>备注“代理加盟”</small></div></li><li data-v-9546d4af><span data-v-9546d4af>3</span><div data-v-9546d4af><strong data-v-9546d4af>沟通合作方案</strong><small data-v-9546d4af>客服一对一为你介绍</small></div></li></ol>',
                                1,
                              )),
                            t("div", ma, [
                              s.value.serviceHours
                                ? (n(),
                                  d("p", ga, [
                                    a[12] ||
                                      (a[12] = t(
                                        "strong",
                                        null,
                                        "服务时间",
                                        -1,
                                      )),
                                    f(g(s.value.serviceHours), 1),
                                  ]))
                                : _("", !0),
                              a[13] ||
                                (a[13] = t(
                                  "p",
                                  null,
                                  [
                                    t("strong", null, "温馨提示"),
                                    f(
                                      "具体合作政策以客服沟通为准，请认准本页展示的客服微信。",
                                    ),
                                  ],
                                  -1,
                                )),
                            ]),
                          ]),
                        ]))
                      : (n(),
                        d("div", ya, [
                          c(o(I), { size: 26, "aria-hidden": "true" }),
                          a[18] ||
                            (a[18] = t(
                              "span",
                              null,
                              "代理客服入口暂未开放，请稍后再来。",
                              -1,
                            )),
                        ])),
              ],
              512,
            ),
            t(
              "dialog",
              {
                ref_key: "posterDialog",
                ref: u,
                class: "poster-dialog",
                "aria-label": "代理加盟宣传海报大图",
                onClick: R,
              },
              [
                t("div", ba, [
                  t(
                    "button",
                    {
                      type: "button",
                      class: "poster-close",
                      "aria-label": "关闭海报大图",
                      title: "关闭",
                      onClick: a[1] || (a[1] = (l) => u.value.close()),
                    },
                    [c(o(O), { size: 18, "aria-hidden": "true" })],
                  ),
                  t(
                    "img",
                    {
                      src: o(q),
                      width: "1254",
                      height: "1254",
                      alt: "代理加盟宣传海报完整大图",
                    },
                    null,
                    8,
                    ha,
                  ),
                  a[20] ||
                    (a[20] = t(
                      "p",
                      null,
                      "案例仅供参考，不构成收益承诺。",
                      -1,
                    )),
                ]),
              ],
              512,
            ),
          ])
        )
      );
    },
  },
  qa = P(wa, [["__scopeId", "data-v-9546d4af"]]);
export { qa as default };

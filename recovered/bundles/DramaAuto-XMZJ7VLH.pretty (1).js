import { _ as t, b as s, e as a, m as o } from "./index-Z8pMLIar.js";
const l = { class: "drama-auto-page" },
  r = "https://mengyan.kk0606.com/home?menu=zhinengti",
  n = {
    __name: "DramaAuto",
    setup(c) {
      return (m, e) => (
        o(),
        s("section", l, [
          a("header", { class: "drama-auto-head" }, [
            e[0] ||
              (e[0] = a(
                "div",
                null,
                [
                  a("span", null, "自动化创作"),
                  a("h1", null, "AI漫剧全功能"),
                  a("p", null, "在客户端内打开漫剧自动化工作台。"),
                ],
                -1,
              )),
            a(
              "a",
              {
                class: "btn-plain",
                href: r,
                target: "_blank",
                rel: "noopener noreferrer",
              },
              "新窗口打开",
            ),
          ]),
          a("div", { class: "drama-auto-frame-wrap" }, [
            a("iframe", {
              class: "drama-auto-frame",
              src: r,
              title: "AI漫剧全功能",
              allow: "fullscreen; clipboard-read; clipboard-write",
            }),
          ]),
        ])
      );
    },
  },
  d = t(n, [["__scopeId", "data-v-252c42cc"]]);
export { d as default };

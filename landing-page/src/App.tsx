import { useEffect, useRef, useState } from "react";
import "./App.css";

import homeImg from "./assets/screens/homepage.png";
import addTxImg from "./assets/screens/transaction.png";
import categoriesImg from "./assets/screens/categories.png";
import foodImg from "./assets/screens/food.png";

import {
  ArrowRight,
  Sparkles,
  Wallet,
  PieChart,
  LayoutGrid,
  ListPlus,
  ShieldCheck,
  Apple,
  Smartphone,
  BadgeCheck,
  Timer,
  Infinity as InfinityIcon,
} from "lucide-react";

type Shot = {
  title: string;
  desc: string;
  img: string;
};

const shots: Shot[] = [
  {
    title: "Home",
    desc: "Tổng quan thu/chi theo tháng, rõ ràng và trực quan.",
    img: homeImg,
  },
  {
    title: "Add transaction",
    desc: "Nhập giao dịch nhanh, chọn danh mục và ngày chỉ trong vài chạm.",
    img: addTxImg,
  },
  {
    title: "Categories",
    desc: "Quản lý danh mục chi tiêu, điều chỉnh ngân sách linh hoạt.",
    img: categoriesImg,
  },
  {
    title: "Food detail",
    desc: "Xem lịch sử giao dịch theo danh mục để tối ưu thói quen chi tiêu.",
    img: foodImg,
  },
];

const features = [
  {
    title: "Theo dõi thu/chi rõ ràng",
    desc: "Biểu đồ và thống kê giúp bạn hiểu dòng tiền theo thời gian.",
    icon: PieChart,
  },
  {
    title: "Danh mục & ngân sách",
    desc: "Đặt ngân sách theo danh mục, theo dõi tiến độ và kiểm soát chi tiêu.",
    icon: LayoutGrid,
  },
  {
    title: "Nhập liệu nhanh",
    desc: "Keypad + gợi ý danh mục giúp ghi nhận giao dịch nhanh và chuẩn.",
    icon: ListPlus,
  },
  {
    title: "Tập trung trải nghiệm",
    desc: "UI tối giản, dễ nhìn, phù hợp dùng hằng ngày.",
    icon: ShieldCheck,
  },
];

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { root: null, threshold: 0.14, rootMargin: "80px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""}`}
      style={{ ["--delay" as any]: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function App() {
  return (
    <div className="page">
      <header className="nav">
        <div className="container nav__inner">
          <div className="brand">
            <div className="brand__logo" aria-hidden>
              <Wallet size={18} />
            </div>
            <span className="brand__name">FinFlow</span>
            <span className="brand__pill">
              <Sparkles size={14} />
              Personal Finance
            </span>
          </div>

          <nav className="nav__links" aria-label="Primary">
            <a href="#features">Tính năng</a>
            <a href="#screens">Giao diện</a>
            <a href="#cta">Tải app</a>
          </nav>

          <a className="btn btn--ghost" href="#cta">
            Get early access <ArrowRight size={16} />
          </a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero__bg" aria-hidden />
          <div className="container hero__inner">
            <Reveal>
              <div className="hero__copy">
                <div className="badge">
                  <BadgeCheck size={16} />
                  Personal Finance • Budget • Tracking
                </div>

                <h1>
                  Quản lý chi tiêu gọn gàng.
                  <br />
                  Tập trung vào điều quan trọng.
                </h1>

                <p className="lead">
                  FinFlow giúp bạn theo dõi thu/chi, phân loại danh mục và quản
                  lý ngân sách bằng giao diện đẹp, nhanh và dễ dùng.
                </p>

                <div className="hero__actions">
                  <a className="btn btn--primary" href="#cta">
                    Tải app (sắp ra mắt) <ArrowRight size={16} />
                  </a>
                  <a className="btn btn--secondary" href="#screens">
                    Xem giao diện
                  </a>
                </div>

                <div className="hero__meta">
                  <div className="stat">
                    <div className="stat__row">
                      <LayoutGrid size={16} />
                      <div className="stat__num">4</div>
                    </div>
                    <div className="stat__label">màn hình chính</div>
                  </div>

                  <div className="stat">
                    <div className="stat__row">
                      <Timer size={16} />
                      <div className="stat__num">60s</div>
                    </div>
                    <div className="stat__label">setup ngân sách</div>
                  </div>

                  <div className="stat">
                    <div className="stat__row">
                      <InfinityIcon size={16} />
                      <div className="stat__num">∞</div>
                    </div>
                    <div className="stat__label">theo dõi thói quen</div>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="hero__visual" aria-label="App previews">
                <div className="stack">
                  <figure className="phone phone--front">
                    <img src={homeImg} alt="FinFlow Home screen preview" />
                  </figure>
                  <figure className="phone phone--back">
                    <img
                      src={addTxImg}
                      alt="FinFlow Add Transaction screen preview"
                    />
                  </figure>
                  <div className="glow" aria-hidden />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="features" className="section">
          <div className="container">
            <Reveal>
              <div className="section__head">
                <h2>Tính năng cốt lõi</h2>
                <p>
                  Các phần quan trọng nhất để bạn kiểm soát dòng tiền mà không
                  bị “ngợp”.
                </p>
              </div>
            </Reveal>

            <div className="grid grid--features">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <Reveal key={f.title} delay={80 + i * 70}>
                    <div className="card">
                      <div className="card__icon" aria-hidden>
                        <Icon size={18} />
                      </div>
                      <h3>{f.title}</h3>
                      <p>{f.desc}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section id="screens" className="section section--alt">
          <div className="container">
            <Reveal>
              <div className="section__head">
                <h2>Giao diện nổi bật</h2>
                <p>4 màn hình chính — tối giản, trực quan, dễ thao tác.</p>
              </div>
            </Reveal>

            <div className="grid grid--shots">
              {shots.map((s, i) => (
                <Reveal key={s.title} delay={80 + i * 70}>
                  <article className="shot">
                    <div className="shot__img">
                      <img
                        src={s.img}
                        alt={`${s.title} preview`}
                        loading="lazy"
                      />
                    </div>
                    <div className="shot__body">
                      <h3>{s.title}</h3>
                      <p>{s.desc}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="cta" className="section">
          <div className="container">
            <Reveal>
              <div className="cta">
                <div className="cta__copy">
                  <h2>Sẵn sàng tối ưu chi tiêu?</h2>
                  <p>
                    Đăng ký nhận thông báo khi FinFlow phát hành để trải nghiệm
                    sớm.
                  </p>
                </div>

                <div className="cta__actions">
                  <a
                    className="btn btn--primary"
                    href="#"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Apple size={16} /> Download for iOS (soon)
                  </a>
                  <a
                    className="btn btn--secondary"
                    href="#"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Smartphone size={16} /> Download for Android (soon)
                  </a>
                </div>
              </div>
            </Reveal>

            <footer className="footer">
              <div className="footer__left">
                <div className="brand brand--small">
                  <div className="brand__logo" aria-hidden>
                    <Wallet size={16} />
                  </div>
                  <span className="brand__name">FinFlow</span>
                </div>
                <span className="muted">
                  © {new Date().getFullYear()} FinFlow
                </span>
              </div>
              <div className="footer__right">
                <a className="muted" href="#features">
                  Tính năng
                </a>
                <a className="muted" href="#screens">
                  Giao diện
                </a>
              </div>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}

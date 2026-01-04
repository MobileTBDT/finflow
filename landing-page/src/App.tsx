import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

import homeImg from "./assets/screens/homepage.png";
import addTxImg from "./assets/screens/transaction.png";
import categoriesImg from "./assets/screens/categories.png";
import foodImg from "./assets/screens/food.png";
import logo from "./assets/screens/logo.png";

import {
  ArrowRight,
  Sparkles,
  PieChart,
  LayoutGrid,
  ListPlus,
  ShieldCheck,
  Apple,
  Smartphone,
  BadgeCheck,
  Timer,
  Infinity as InfinityIcon,
  CheckCircle2,
  TrendingUp,
  Target,
  CalendarDays,
  CreditCard,
  Lock,
  ChevronDown,
  Star,
  Zap,
} from "lucide-react";

type Shot = {
  title: string;
  desc: string;
  img: string;
};

type Feature = {
  title: string;
  desc: string;
  icon: React.ComponentType<{ size?: number }>;
};

type Step = {
  title: string;
  desc: string;
  icon: React.ComponentType<{ size?: number }>;
};

type FAQ = {
  q: string;
  a: string;
};

const shots: Shot[] = [
  {
    title: "Home",
    desc: "Tổng quan thu/chi theo tháng, rõ ràng và trực quan.",
    img: homeImg,
  },
  {
    title: "Add transaction",
    desc: "Nhập giao dịch nhanh, chọn danh mục & ngày chỉ trong vài chạm.",
    img: addTxImg,
  },
  {
    title: "Categories",
    desc: "Quản lý danh mục và ngân sách linh hoạt theo nhu cầu.",
    img: categoriesImg,
  },
  {
    title: "Food detail",
    desc: "Xem chi tiết theo danh mục để tối ưu thói quen chi tiêu.",
    img: foodImg,
  },
];

const features: Feature[] = [
  {
    title: "Theo dõi thu/chi rõ ràng",
    desc: "Biểu đồ & thống kê giúp bạn hiểu dòng tiền theo thời gian.",
    icon: PieChart,
  },
  {
    title: "Danh mục & ngân sách",
    desc: "Đặt ngân sách theo danh mục, theo dõi tiến độ dễ dàng.",
    icon: LayoutGrid,
  },
  {
    title: "Nhập liệu nhanh",
    desc: "Keypad + gợi ý danh mục để ghi nhận giao dịch nhanh & chuẩn.",
    icon: ListPlus,
  },
  {
    title: "Trải nghiệm tối giản",
    desc: "UI gọn gàng, tập trung vào thao tác quan trọng hằng ngày.",
    icon: ShieldCheck,
  },
];

const steps: Step[] = [
  {
    title: "Chọn loại giao dịch",
    desc: "Thu hoặc chi — tách bạch rõ ràng ngay từ đầu.",
    icon: CreditCard,
  },
  {
    title: "Nhập số tiền nhanh",
    desc: "Keypad tối ưu tốc độ, có gợi ý mức phổ biến.",
    icon: Zap,
  },
  {
    title: "Chọn danh mục",
    desc: "Danh mục trực quan giúp phân loại chính xác.",
    icon: Target,
  },
  {
    title: "Chọn ngày & ghi chú",
    desc: "Dễ dàng backdate, thêm note để tra cứu sau này.",
    icon: CalendarDays,
  },
];

const faqs: FAQ[] = [
  {
    q: "Ứng dụng hỗ trợ những nền tảng nào?",
    a: "Hiện tại phiên bản ổn định nhất hoạt động trên Android (tối ưu cho Android 13 trở lên). Phiên bản iOS đang trong lộ trình phát triển và sẽ sớm ra mắt.",
  },
  {
    q: "Sử dụng ứng dụng có mất phí không?",
    a: "Hoàn toàn miễn phí. Mục tiêu của chúng tôi là mang lại trải nghiệm quản lý tài chính hiệu quả và dễ dàng nhất cho mọi người dùng.",
  },
  {
    q: "Dữ liệu cá nhân của tôi có được bảo mật?",
    a: "Chúng tôi cam kết bảo mật tuyệt đối. Mọi dữ liệu giao dịch và thông tin cá nhân đều được mã hóa và không chia sẻ với bên thứ ba.",
  },
  {
    q: "Tôi có thể sử dụng ứng dụng khi không có mạng không?",
    a: "Có. Ứng dụng hỗ trợ chế độ Offline (ngoại tuyến). Dữ liệu sẽ tự động đồng bộ lên hệ thống ngay khi thiết bị kết nối Internet trở lại.",
  },
  {
    q: "Làm sao để báo lỗi hoặc đóng góp ý kiến?",
    a: "Bạn có thể gửi phản hồi trực tiếp qua email hỗ trợ của nhóm phát triển.",
  },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reducedMotion) {
      setVisible(true);
      return;
    }

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
      { threshold: 0.14, rootMargin: "120px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [reducedMotion]);

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

function Pill({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
}) {
  return (
    <span className="pill">
      <Icon size={14} />
      {label}
    </span>
  );
}

function FAQItem({ item }: { item: FAQ }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq ${open ? "is-open" : ""}`}>
      <button
        className="faq__q"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{item.q}</span>
        <ChevronDown size={18} />
      </button>
      <div className="faq__a" role="region">
        <p>{item.a}</p>
      </div>
    </div>
  );
}

export default function App() {
  const highlights = useMemo(
    () => [
      { icon: TrendingUp, label: "Insight rõ ràng" },
      { icon: Target, label: "Budget theo danh mục" },
      { icon: Timer, label: "Nhập nhanh mỗi ngày" },
      { icon: Lock, label: "Tập trung privacy" },
    ],
    []
  );

  return (
    <div className="page">
      <header className="nav">
        <div className="container nav__inner">
          <div className="brand">
            <div className="brand__logo" aria-hidden>
              <img
                src={logo}
                alt="FinFlow Logo"
                style={{ width: "24px", height: "24px" }}
              />
            </div>
            <span className="brand__name">FinFlow</span>
            <span className="brand__pill">
              <Sparkles size={14} />
              Personal Finance
            </span>
          </div>

          <nav className="nav__links" aria-label="Primary">
            <a href="#about">Giới thiệu</a>
            <a href="#features">Tính năng</a>
            <a href="#how">Cách hoạt động</a>
            <a href="#screens">Giao diện</a>
            <a href="#faq">FAQ</a>
            <a href="#cta">Tải app</a>
          </nav>

          <a className="btn btn--ghost" href="#cta">
            Get early access <ArrowRight size={16} />
          </a>
        </div>
      </header>

      <main>
        {/* HERO */}
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

                <div className="hero__pills" aria-label="Highlights">
                  {highlights.map((h) => (
                    <Pill key={h.label} icon={h.icon} label={h.label} />
                  ))}
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

        {/* WHY */}
        <section id="about" className="section section--alt">
          <div className="container">
            <Reveal>
              <div className="section__head">
                <h2>Tại sao FinFlow?</h2>
                <p>
                  Đủ sâu để quản lý dòng tiền, đủ đơn giản để dùng hằng ngày.
                </p>
              </div>
            </Reveal>

            <div className="grid grid--why">
              <Reveal delay={80}>
                <div className="panel">
                  <h3>Vấn đề</h3>
                  <ul className="list">
                    <li>
                      <CheckCircle2 size={16} /> Ghi chép rời rạc, khó tổng hợp
                    </li>
                    <li>
                      <CheckCircle2 size={16} /> Nhiều app quá phức tạp để duy
                      trì
                    </li>
                    <li>
                      <CheckCircle2 size={16} /> Budget không rõ ràng theo danh
                      mục
                    </li>
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={140}>
                <div className="panel panel--accent">
                  <h3>Giải pháp</h3>
                  <ul className="list">
                    <li>
                      <CheckCircle2 size={16} /> UI tối giản, thao tác nhanh
                    </li>
                    <li>
                      <CheckCircle2 size={16} /> Danh mục trực quan, dễ phân
                      loại
                    </li>
                    <li>
                      <CheckCircle2 size={16} /> Theo dõi ngân sách theo danh
                      mục
                    </li>
                  </ul>
                </div>
              </Reveal>
            </div>

            <Reveal delay={200}>
              <div className="trust">
                <div className="trust__item">
                  <Star size={16} />
                  <span>Trực quan</span>
                </div>
                <div className="trust__item">
                  <Star size={16} />
                  <span>Nhanh</span>
                </div>
                <div className="trust__item">
                  <Star size={16} />
                  <span>Nhất quán</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* FEATURES */}
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

        {/* HOW IT WORKS */}
        <section id="how" className="section section--alt">
          <div className="container">
            <Reveal>
              <div className="section__head">
                <h2>Cách hoạt động</h2>
                <p>Quy trình nhập giao dịch gọn, đúng thứ tự — giảm sai sót.</p>
              </div>
            </Reveal>

            <div className="grid grid--steps">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <Reveal key={s.title} delay={80 + i * 70}>
                    <div className="step">
                      <div className="step__top">
                        <div className="step__icon" aria-hidden>
                          <Icon size={18} />
                        </div>
                        <div className="step__index">0{i + 1}</div>
                      </div>
                      <h3>{s.title}</h3>
                      <p>{s.desc}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* SCREENS */}
        <section id="screens" className="section">
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

        {/* FAQ */}
        <section id="faq" className="section section--alt">
          <div className="container">
            <Reveal>
              <div className="section__head">
                <h2>FAQ</h2>
                <p>Một vài câu hỏi thường gặp trước khi release.</p>
              </div>
            </Reveal>

            <div className="faq__grid">
              {faqs.map((f, i) => (
                <Reveal key={f.q} delay={80 + i * 60}>
                  <FAQItem item={f} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
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

                  <div className="cta__note">
                    <Lock size={16} />
                    <span>Không spam. Bạn có thể hủy bất cứ lúc nào.</span>
                  </div>
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

                  <form className="email" onSubmit={(e) => e.preventDefault()}>
                    <input
                      className="email__input"
                      placeholder="Email để nhận thông báo"
                      type="email"
                    />
                    <button className="email__btn" type="submit">
                      Notify me <ArrowRight size={16} />
                    </button>
                  </form>
                </div>
              </div>
            </Reveal>

            <footer className="footer">
              <div className="footer__left">
                <div className="brand brand--small">
                  <div className="brand__logo" aria-hidden>
                    <img
                      src={logo}
                      alt="FinFlow Logo"
                      style={{ width: "20px", height: "20px" }}
                    />
                  </div>
                  <span className="brand__name">FinFlow</span>
                </div>
                <span className="muted">
                  © {new Date().getFullYear()} FinFlow
                </span>
              </div>
              <div className="footer__right">
                <a className="muted" href="#about">
                  Giới thiệu
                </a>
                <a className="muted" href="#screens">
                  Giao diện
                </a>
                <a className="muted" href="#faq">
                  FAQ
                </a>
              </div>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useTheme } from "./hooks/useTheme";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { loadPortfolio } from "./api/client";
import { setSoundEnabled } from "./sound";
import Navbar from "./components/Navbar";
import FloatingDecor from "./components/FloatingDecor";
import PixelWindow from "./components/PixelWindow";
import ProjectModal from "./components/ProjectModal";
import Confetti from "./components/Confetti";
import Mascot from "./components/mascot/Mascot";
import Marquee from "./components/Marquee";
import PixelDivider from "./components/PixelDivider";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Skills from "./sections/Skills";
import Projects from "./sections/Projects";
import Experience from "./sections/Experience";
import Contact from "./sections/Contact";
import Footer from "./sections/Footer";

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];

function Loading() {
  return (
    <div className="loading-wrap">
      <PixelWindow title="LOADING..." titleAs="p">
        <p className="load-text">LOADING...</p>
      </PixelWindow>
    </div>
  );
}

export default function App() {
  const { theme, toggle } = useTheme();
  const reduced = useReducedMotion();
  const [soundOn, setSoundOn] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState("home");
  const [aliHidden, setAliHidden] = useState(false);
  const [project, setProject] = useState(null);

  useEffect(() => {
    try {
      if (localStorage.getItem("sound") === "1") {
        setSoundOn(true);
        setSoundEnabled(true);
      }
      if (localStorage.getItem("ali-hidden") === "1") setAliHidden(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancel = false;
    loadPortfolio().then((next) => {
      if (!cancel) {
        setData(next);
        setLoading(false);
      }
    });
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    const nodes = [...document.querySelectorAll("main section[id]")];
    if (!nodes.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setSection(visible.target.id);
      },
      { threshold: [0.25, 0.5], rootMargin: "-15% 0px -45% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    const pop = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-in");
        });
      },
      { threshold: 0.2 },
    );
    nodes.forEach((node) => pop.observe(node));
    return () => {
      observer.disconnect();
      pop.disconnect();
    };
  }, [loading]);

  useEffect(() => {
    const buffer = [];
    function onKey(event) {
      buffer.push(event.key.toLowerCase());
      if (buffer.length > KONAMI.length) buffer.shift();
      if (KONAMI.every((key, index) => buffer[index] === key)) {
        buffer.length = 0;
        window.dispatchEvent(new Event("ali:dance"));
        document.documentElement.dataset.invert = "on";
        window.setTimeout(() => {
          delete document.documentElement.dataset.invert;
        }, 5000);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onVis() {
      document.body.classList.toggle("is-hidden", document.hidden);
    }
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  function toggleAli() {
    setAliHidden((current) => {
      const next = !current;
      try {
        localStorage.setItem("ali-hidden", next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Navbar
        theme={theme}
        onToggleTheme={toggle}
        soundOn={soundOn}
        onToggleSound={setSoundOn}
        section={section}
      />
      <FloatingDecor reduced={reduced} />
      <main id="main" className="site-main">
        {loading || !data ? <Loading /> : (
          <>
            <Hero profile={data.profile} theme={theme} />
            <PixelDivider />
            <About profile={data.profile} experience={data.experience} />
            <Marquee skills={data.skills} />
            <Skills skills={data.skills} />
            <PixelDivider />
            <Projects projects={data.projects} onOpen={setProject} />
            <PixelDivider />
            <Experience experience={data.experience} education={data.profile.education} />
            <PixelDivider />
            <Contact profile={data.profile} />
          </>
        )}
      </main>
      <Footer aliHidden={aliHidden} onToggleAli={toggleAli} />
      <Mascot hidden={aliHidden} section={section} theme={theme} reduced={reduced} />
      {project ? <ProjectModal project={project} onClose={() => setProject(null)} /> : null}
      <Confetti />
    </>
  );
}

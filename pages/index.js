import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { jsPDF } from "jspdf";

import EditorArea from "@/components/EditorArea";
import EditorHeader from "@/components/EditorHeader";
import EditorFooter from "@/components/EditorFooter";
import ClearModal from "@/components/ClearModal";
import InfoModal from "@/components/InfoModal";

export default function Writer() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [footer, setFooter] = useState("");
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [iconsVisible, setIconsVisible] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [font, setFont] = useState("sans");

  const titleRef = useRef(null);
  const bodyRef = useRef(null);
  const downloadRef = useRef(null);
  const hasMounted = useRef(false);
  const toastTimeoutRef = useRef(null);
  const timeoutIdRef = useRef(null);

  const adjustTextareaHeight = (textarea) => {
    if (!textarea || !(textarea instanceof HTMLElement)) return;
    textarea.style.boxSizing = "border-box";
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // Adjust height when title changes
  useEffect(() => {
    if (titleRef.current) adjustTextareaHeight(titleRef.current);
  }, [title]);

  // Re-adjust after fonts load so scrollHeight uses correct Satoshi metrics
  useEffect(() => {
    document.fonts.ready.then(() => {
      if (titleRef.current) adjustTextareaHeight(titleRef.current);
    });
  }, []);

  // Set footer timestamp on first keystroke, only if not already set
  useEffect(() => {
    const bodyText = body.replace(/<[^>]+>/g, "").trim();
    if (!footer && (title || bodyText)) {
      const now = new Date();
      const day = now.getDate();
      const month = now.toLocaleString("en-US", { month: "long" });
      const year = now.getFullYear();
      const h = now.getHours();
      const min = now.getMinutes().toString().padStart(2, "0");
      const ampm = h >= 12 ? "PM" : "AM";
      const hour = h % 12 || 12;
      setFooter(`Created on ${day} ${month} ${year}, ${hour}.${min}${ampm}`);
    }
  }, [title, body, footer]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTitle = localStorage.getItem("title");
    const savedBody = localStorage.getItem("body");
    const savedFooter = localStorage.getItem("footer");
    if (savedTitle) setTitle(savedTitle);
    if (savedBody) setBody(savedBody);
    if (savedFooter) setFooter(savedFooter);
  }, []);

  // Save to localStorage on change, skip the initial mount to avoid
  // overwriting stored data before the load effect's state updates apply
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    localStorage.setItem("title", title);
    localStorage.setItem("body", body);
    localStorage.setItem("footer", footer);
  }, [title, body, footer]);

  // Hide UI after 5s of no mouse movement
  const handleMouseMove = () => {
    setIconsVisible(true);
    clearTimeout(timeoutIdRef.current);
    timeoutIdRef.current = setTimeout(() => setIconsVisible(false), 5000);
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeoutIdRef.current);
    };
  }, []);

  // Track keyboard height via Visual Viewport API
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const handler = () => {
      const h = window.innerHeight - window.visualViewport.offsetTop - window.visualViewport.height;
      setKeyboardHeight(Math.max(0, h));
    };
    window.visualViewport.addEventListener("resize", handler);
    window.visualViewport.addEventListener("scroll", handler);
    return () => {
      window.visualViewport.removeEventListener("resize", handler);
      window.visualViewport.removeEventListener("scroll", handler);
    };
  }, []);

  // Close download dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target)) {
        setIsDownloadOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Download helpers ---

  const walkHtml = (html, onText, onBlock, onBr) => {
    const container = document.createElement("div");
    container.innerHTML = html;
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) { onText(node.textContent || ""); return; }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const tag = node.tagName.toLowerCase();
      if (tag === "br") { onBr(); return; }
      const isBlock = tag === "div" || tag === "p";
      if (isBlock) {
        onBlock();
        const onlyBr = node.childNodes.length === 1 && node.firstChild?.tagName?.toLowerCase() === "br";
        if (!onlyBr) for (const child of node.childNodes) walk(child);
        return;
      }
      for (const child of node.childNodes) walk(child);
    };
    for (const child of container.childNodes) walk(child);
  };

  const stripHtml = (html) => {
    const parts = [];
    walkHtml(html,
      (text) => parts.push(text),
      () => parts.push("\n"),
      () => parts.push("\n"),
    );
    return parts.join("").replace(/^\n+/, "").replace(/\n{3,}/g, "\n\n").trim();
  };

  const htmlToMd = (html) => {
    return html
      .replace(/<strong>([\s\S]*?)<\/strong>/gi, "**$1**")
      .replace(/<b>([\s\S]*?)<\/b>/gi, "**$1**")
      .replace(/<em>([\s\S]*?)<\/em>/gi, "*$1*")
      .replace(/<i>([\s\S]*?)<\/i>/gi, "*$1*")
      .replace(/<del>([\s\S]*?)<\/del>/gi, "~~$1~~")
      .replace(/<s>([\s\S]*?)<\/s>/gi, "~~$1~~")
      .replace(/<u>([\s\S]*?)<\/u>/gi, "_$1_")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<div>/gi, "\n")
      .replace(/<\/div>/gi, "")
      .replace(/<p>/gi, "\n")
      .replace(/<\/p>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  const triggerToast = () => {
    clearTimeout(toastTimeoutRef.current);
    setShowToast(true);
    toastTimeoutRef.current = setTimeout(() => setShowToast(false), 2500);
  };

  const getDefaultTitle = () => `Untitled-${new Date().toISOString().slice(0, 10)}`;

  const downloadTxtFile = () => {
    const fileTitle = title.trim() || getDefaultTitle();
    const blob = new Blob([`${fileTitle}\n\n${stripHtml(body)}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileTitle}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    triggerToast();
  };

  const downloadMdFile = () => {
    const fileTitle = title.trim() || getDefaultTitle();
    const blob = new Blob([`# ${fileTitle}\n\n${htmlToMd(body)}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileTitle}.md`;
    link.click();
    URL.revokeObjectURL(url);
    triggerToast();
  };

  const downloadPdfFile = () => {
    const fileTitle = title.trim() || getDefaultTitle();
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    const maxY = pageHeight - margin;
    let y = margin + 5;

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text(fileTitle, margin, y);
    y += 10;

    // Parse HTML body into styled segments
    const lineHeight = 6;
    doc.setFontSize(11);

    const container = document.createElement("div");
    container.innerHTML = body;
    const segments = [];

    const nl = { text: "\n", bold: false, italic: false, underline: false, strike: false };

    const walk = (node, styles) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        if (!text) return;
        // Split on literal \n so legacy plain-text content with newlines works
        const parts = text.split("\n");
        parts.forEach((part, i) => {
          if (part) segments.push({ text: part, ...styles });
          if (i < parts.length - 1) segments.push(nl);
        });
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const tag = node.tagName.toLowerCase();
      const s = { ...styles };
      if (tag === "b" || tag === "strong") s.bold = true;
      if (tag === "i" || tag === "em") s.italic = true;
      if (tag === "u") s.underline = true;
      if (tag === "del" || tag === "s") s.strike = true;
      if (tag === "br") { segments.push(nl); return; }
      if (tag === "div" || tag === "p") {
        segments.push(nl);
        // <div><br></div> is an empty line placeholder — skip the <br> child
        // to avoid generating a double newline for a single blank line
        const onlyBr = node.childNodes.length === 1 && node.firstChild?.tagName?.toLowerCase() === "br";
        if (!onlyBr) for (const child of node.childNodes) walk(child, s);
        return;
      }
      for (const child of node.childNodes) walk(child, s);
    };

    for (const child of container.childNodes) {
      walk(child, { bold: false, italic: false, underline: false, strike: false });
    }

    // Render segments with inline styles
    let curX = margin;
    let firstContent = false;

    const newLine = () => {
      curX = margin;
      y += lineHeight;
      if (y > maxY) { doc.addPage(); y = margin + 5; }
    };

    for (const seg of segments) {
      if (seg.text === "\n") {
        if (firstContent) newLine();
        continue;
      }
      firstContent = true;

      let fontStyle = "normal";
      if (seg.bold && seg.italic) fontStyle = "bolditalic";
      else if (seg.bold) fontStyle = "bold";
      else if (seg.italic) fontStyle = "italic";
      doc.setFont("Helvetica", fontStyle);
      doc.setTextColor(0);

      for (const token of seg.text.split(/(\s+)/)) {
        if (!token) continue;
        const tw = doc.getTextWidth(token);
        if (curX > margin && curX + tw > margin + maxWidth) newLine();
        if (!(curX === margin && token.trim() === "")) {
          doc.text(token, curX, y);
          if (seg.underline) {
            doc.setLineWidth(0.2);
            doc.line(curX, y + 0.8, curX + tw, y + 0.8);
          }
          if (seg.strike) {
            doc.setLineWidth(0.2);
            doc.line(curX, y - 2.2, curX + tw, y - 2.2);
          }
        }
        curX += tw;
      }
    }

    doc.save(`${fileTitle}.pdf`);
    triggerToast();
  };

  // --- Modal handlers ---

  const clearContent = () => {
    setTitle("");
    setBody("");
    setFooter("");
    localStorage.removeItem("title");
    localStorage.removeItem("body");
    localStorage.removeItem("footer");
    setIsModalOpen(false);
  };

  return (
    <>
      <Head>
        <title>Writer</title>
        <meta itemProp="name" content="Writer" />
        <meta name="twitter:title" content="Writer" />
        <meta property="og:title" content="Writer" />
        <meta property="og:site_name" content="Writer" />
        <meta name="description" content="Write without distraction, download when finished" />
        <meta property="og:description" content="Write without distraction, download when finished" />
        <meta property="twitter:description" content="Write without distraction, download when finished" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="apple-touch-icon" sizes="57x57" href="/faviconp/apple-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/faviconp/apple-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/faviconp/apple-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/faviconp/apple-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/faviconp/apple-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/faviconp/apple-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/faviconp/apple-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/faviconp/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/faviconp/apple-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/faviconp/android-icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/faviconp/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/faviconp/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/faviconp/favicon-16x16.png" />
        <link rel="manifest" href="/faviconp/manifest.json" />
        <meta name="msapplication-TileColor" content="#171717" />
        <meta name="msapplication-TileImage" content="/faviconp/ms-icon-144x144.png" />
        <meta name="theme-color" content="#171717" />
      </Head>

      <div className="flex flex-col items-center pt-28 min-h-screen w-full special-t">
        <EditorArea
          title={title}
          setTitle={setTitle}
          body={body}
          setBody={setBody}
          titleRef={titleRef}
          bodyRef={bodyRef}
          adjustTextareaHeight={adjustTextareaHeight}
          keyboardHeight={keyboardHeight}
          font={font}
        />

        <EditorFooter
          iconsVisible={iconsVisible}
          footer={footer}
          title={title}
          body={body}
        />

        <EditorHeader
          iconsVisible={iconsVisible}
          isDownloadOpen={isDownloadOpen}
          setIsDownloadOpen={setIsDownloadOpen}
          downloadRef={downloadRef}
          downloadPdfFile={downloadPdfFile}
          downloadMdFile={downloadMdFile}
          downloadTxtFile={downloadTxtFile}
          openClearModal={() => setIsModalOpen(true)}
          openInfoModal={() => setIsInfoOpen(true)}
          font={font}
          setFont={setFont}
        />
      </div>

      <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-40 transition-opacity duration-500 ${showToast ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="bg-white dark:bg-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.12)] rounded-2xl px-5 py-3 text-xs whitespace-nowrap">
          Download successful!
        </div>
      </div>

      <ClearModal
        isModalOpen={isModalOpen}
        clearContent={clearContent}
        cancelClear={() => setIsModalOpen(false)}
      />

      <InfoModal
        isInfoOpen={isInfoOpen}
        closeInfoModal={() => setIsInfoOpen(false)}
      />
    </>
  );
}

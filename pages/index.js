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

  const titleRef = useRef(null);
  const bodyRef = useRef(null);
  const downloadRef = useRef(null);
  const hasMounted = useRef(false);
  const toastTimeoutRef = useRef(null);
  let timeoutId = null;

  const adjustTextareaHeight = (textarea) => {
    if (!textarea || !(textarea instanceof HTMLElement)) return;
    textarea.style.boxSizing = "border-box";
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // Adjust height when content changes
  useEffect(() => {
    if (titleRef.current) adjustTextareaHeight(titleRef.current);
    if (bodyRef.current) adjustTextareaHeight(bodyRef.current);
  }, [title, body]);

  // Re-adjust after fonts load so scrollHeight uses correct Satoshi metrics
  useEffect(() => {
    document.fonts.ready.then(() => {
      if (titleRef.current) adjustTextareaHeight(titleRef.current);
      if (bodyRef.current) adjustTextareaHeight(bodyRef.current);
    });
  }, []);

  // Set footer timestamp on first keystroke, only if not already set
  useEffect(() => {
    if (!footer && (title || body)) {
      const now = new Date();
      setFooter(`Created on ${now.toLocaleString("en-US", { timeZoneName: "short" })}`);
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
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => setIconsVisible(false), 5000);
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeoutId);
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

  const triggerToast = () => {
    clearTimeout(toastTimeoutRef.current);
    setShowToast(true);
    toastTimeoutRef.current = setTimeout(() => setShowToast(false), 2500);
  };

  const getDefaultTitle = () => `Untitled-${new Date().toISOString().slice(0, 10)}`;

  const downloadTxtFile = () => {
    const fileTitle = title.trim() || getDefaultTitle();
    const blob = new Blob([`${fileTitle}\n\n${body}`], { type: "text/plain" });
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
    const blob = new Blob([`# ${fileTitle}\n\n${body}`], { type: "text/markdown" });
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

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);
    doc.splitTextToSize(body, maxWidth).forEach((line) => {
      if (y > maxY) { doc.addPage(); y = margin + 5; }
      doc.text(line, margin, y);
      y += 6;
    });

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

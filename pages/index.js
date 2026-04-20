import { useState, useEffect, useRef } from "react";
import Head from 'next/head';

export default function Writer() {
  const [title, setTitle] = useState("");
  const titleRef = useRef(null);
  const bodyRef = useRef(null);
  const [footer, setFooter] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [body, setBody] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [isInfoOpen, setIsInfoOpen] = useState(false); // Info state
  const [iconsVisible, setIconsVisible] = useState(true); // Track visibility of icons
  let timeoutId = null; // Store the timeout ID for resetting

  // Generalized function to adjust textarea height dynamically
  const adjustTextareaHeight = (textarea) => {
    if (!textarea || !(textarea instanceof HTMLElement)) {
      console.error("Invalid textarea element provided:", textarea);
      return; // Safeguard against undefined or incorrect references
    }

    textarea.style.boxSizing = "border-box"; // Include padding and borders
    textarea.style.height = "auto"; // Reset height to auto to measure correct scrollHeight
    const heightAdjustment = textarea.scrollHeight// Add extra buffer
    textarea.style.height = `${heightAdjustment}px`;
  };

  // Adjust heights on mount or when content changes
  useEffect(() => {
    if (titleRef.current) adjustTextareaHeight(titleRef.current);
    if (bodyRef.current) adjustTextareaHeight(bodyRef.current);
  }, [title, body]);

  // Update the footer with the timestamp when typing starts
  useEffect(() => {
    if (startTime === null && (title || body)) {
      const now = new Date();
      const formattedTime = now.toLocaleString("en-US", {
        timeZoneName: "short",
      });
      setFooter(`Created on ${formattedTime}`);
      setStartTime(now);
    }
  }, [title, body, startTime]);

  // Load content from localStorage when the component mounts
  useEffect(() => {
    const savedTitle = localStorage.getItem("title");
    const savedBody = localStorage.getItem("body");

    if (savedTitle) setTitle(savedTitle);
    if (savedBody) setBody(savedBody);
  }, []);

  // Save content to localStorage whenever title or body changes
  useEffect(() => {
    localStorage.setItem("title", title);
    localStorage.setItem("body", body);
  }, [title, body]);

  const downloadTxtFile = () => {
    const fileTitle = title.trim() !== "" ? title : "Untitled"; // Use "Untitled" if title is empty
    const content = `${fileTitle}\n\n${body}\n\n${footer}`; // Include "Untitled" in content if title is empty
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileTitle}.txt`; // Use the dynamic file name
    link.click();
  };

  // Function to calculate word count for title and body
  const countWords = (title, body) => {
    const combinedText = `${title} ${body}`.trim(); // Combine title and body with a space
    const words = combinedText.split(/\s+/); // Split by whitespace
    return words.length === 1 && words[0] === "" ? 0 : words.length; // Return 0 if combined text is empty
  };

  // Function to open the confirmation modal
  const openClearModal = () => {
    setIsModalOpen(true);
  };

  const closeInfoModal = () => {
    setIsInfoOpen(false);
  };

  const openInfoModal = () => {
    setIsInfoOpen(true);
  };

  // Function to clear the content
  const clearContent = () => {
    setTitle("");
    setBody("");
    setFooter("");
    setStartTime(null);
    localStorage.removeItem("title");
    localStorage.removeItem("body");
    setIsModalOpen(false); // Close the modal after clearing
  };

  // Function to cancel and close the modal
  const cancelClear = () => {
    setIsModalOpen(false); // Close the modal without clearing
  };

  // Handle mouse movement to reset timer and show icons
  const handleMouseMove = () => {
    setIconsVisible(true); // Show icons
    clearTimeout(timeoutId); // Clear any existing timeout
    timeoutId = setTimeout(() => {
      setIconsVisible(false); // Hide icons after 3 seconds
    }, 5000);
  };

  // Add event listener for mouse movement when the component mounts
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeoutId); // Clean up the timeout when the component unmounts
    };
  }, []);

  return (
    <>
      <Head>
        <title>Writer</title>
        <meta itemprop="name" content="Writer" />
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
        <link rel="icon" type="image/png" sizes="32x32" href="/faviconp/faviconp-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/faviconp/faviconp-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/faviconp/faviconp-16x16.png" />
        <link rel="manifest" href="/faviconp/manifest.json" />
        <meta name="msapplication-TileColor" content="#171717" />
        <meta name="msapplication-TileImage" content="/faviconp/ms-icon-144x144.png" />
        <meta name="theme-color" content="#171717"></meta>

      </Head>

      <div className="flex flex-col items-center pt-28 min-h-screen w-full special-t">

        <div className="w-full max-w-3xl px-8">
          {/* Title Input */}
          <textarea
            type="text"
            className="w-full mb-14 tracking-wide text-[17px] font-bold focus:outline-none focus:ring-0 special-t placeholder:text-neutral-400 dark:placeholder:text-neutral-600 dark:bg-neutral-900"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onInput={adjustTextareaHeight}
            style={{ overflow: "hidden", resize: "none" }}
            rows={1}
            ref={titleRef}
          />

          <textarea
            className="w-full mb-28 text-[17px] tracking-wide leading-[30px] font-medium focus:outline-none focus:ring-0 special-t placeholder:text-neutral-400 dark:placeholder:text-neutral-600 bg-white dark:bg-neutral-900"
            placeholder="Type here"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onInput={adjustTextareaHeight}
            style={{ overflow: "hidden", resize: "none", lineHeight: "32px", paddingBottom: "-40px" }}
            ref={bodyRef}
          />
        </div>

        {/* Footer Display */}
        {iconsVisible && (
          <div className="w-fit max-w-[240px] text-xs dark:text-neutral-400 text-neutral-500 fixed bottom-0 self-start pb-5 pl-5">
            {footer || "Only you can see what you write. Content is stored locally."}
          </div>
        )}
        {/* Word Count */}
        {iconsVisible && (
          <div className="w-fit text-xs dark:text-neutral-400 text-neutral-500 fixed bottom-0 self-end pb-5 pr-5">
            {countWords(body, title)} {countWords(body, title) === 1 ? "word" : "words"}
          </div>
        )}

        {/* Buttonsss */}
        <div className="fixed top-0 self-end z-20 m-5 flex items-center gap-x-3">
          {/* Download Button */}
          {iconsVisible && (
            <div className="flex justify-center group">
              <button
                onClick={downloadTxtFile}
                className="fill-neutral-400 hover:fill-black dark:hover:fill-white w-[30px] transform-all duration-500 "
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                  <path d="M480-328.46 309.23-499.23l42.16-43.38L450-444v-336h60v336l98.61-98.61 42.16 43.38L480-328.46ZM252.31-180Q222-180 201-201q-21-21-21-51.31v-108.46h60v108.46q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85h455.38q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-108.46h60v108.46Q780-222 759-201q-21 21-51.31 21H252.31Z" />
                </svg>
              </button>
              <div className="text-xs absolute z-20 mt-10 dark:text-white text-black invisible lg:group-hover:visible">Download</div>
            </div>
          )}

          {/* Clear Button */}
          {iconsVisible && (
            <div className="flex justify-center group">
              <button
                onClick={openClearModal} // Open modal instead of clearing directly
                className="fill-neutral-400 hover:fill-black dark:hover:fill-white w-[30px] transform-all duration-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="m449.08-333.85 104-104 104 104L699.23-376l-104-104 104-104-42.15-42.15-104 104-104-104L406.92-584l104 104-104 104 42.16 42.15ZM363.46-180q-17.17 0-32.54-7.58-15.36-7.58-25.3-20.96L100-480l205.62-271.46q9.94-13.38 25.3-20.96 15.37-7.58 32.54-7.58h424.23q29.83 0 51.07 21.24Q860-737.52 860-707.69v455.38q0 29.83-21.24 51.07Q817.52-180 787.69-180H363.46ZM175-480l178.46 235.38q1.92 2.31 4.42 3.47 2.5 1.15 5.58 1.15h424.23q5.39 0 8.85-3.46t3.46-8.85v-455.38q0-5.39-3.46-8.85t-8.85-3.46H363.46q-3.08 0-5.58 1.15-2.5 1.16-4.42 3.47L175-480Zm400.38 0Z" /></svg>
              </button>
              <div className="text-xs absolute z-20 mt-10 dark:text-white text-black invisible lg:group-hover:visible">Clear</div>
            </div>
          )}

          {/* Info Button */}
          {iconsVisible && (
            <div className="flex justify-center group">
              <button
                onClick={openInfoModal} // Open modal instead of clearing directly
                className="fill-neutral-400 hover:fill-black dark:hover:fill-white w-[30px] transform-all duration-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" ><path d="M450-290h60v-230h-60v230Zm30-298.46q13.73 0 23.02-9.29t9.29-23.02q0-13.73-9.29-23.02-9.29-9.28-23.02-9.28t-23.02 9.28q-9.29 9.29-9.29 23.02t9.29 23.02q9.29 9.29 23.02 9.29Zm.07 488.46q-78.84 0-148.21-29.92t-120.68-81.21q-51.31-51.29-81.25-120.63Q100-401.1 100-479.93q0-78.84 29.92-148.21t81.21-120.68q51.29-51.31 120.63-81.25Q401.1-860 479.93-860q78.84 0 148.21 29.92t120.68 81.21q51.31 51.29 81.25 120.63Q860-558.9 860-480.07q0 78.84-29.92 148.21t-81.21 120.68q-51.29 51.31-120.63 81.25Q558.9-100 480.07-100Zm-.07-60q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg>
              </button>
              <div className="text-xs absolute z-20 mt-10 dark:text-white text-black invisible lg:group-hover:visible">Info</div>
            </div>
          )}
        </div>

      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="bg-white dark:bg-neutral-800 p-6 md:p-12 shadow-lg min-w-[250px] rounded-lg justify-center">
            <h2 className="text-base font-medium mb-8">Are you sure you want to clear all?</h2>
            <div className="flex justify-between gap-x-3 w-full">
              <button
                onClick={clearContent}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-900 text-white rounded-md duration-500 transform-all w-full text-sm"
              >
                Yes
              </button>
              <button
                onClick={cancelClear}
                className="text-black dark:text-white px-4 py-2 hover:bg-neutral-200 border-[1px] border-neutral-200 rounded-md duration-500 transform-all w-full text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isInfoOpen && (
        <div className="fixed inset-0 flex items-center z-30 flex flex-col max-w-full">


          <div className="bg-white dark:bg-neutral-800 p-5 w-full h-full flex flex-col overflow-y-auto relative">
            <div className="w-full text-right justify-end flex sticky top-0">
              <div onClick={closeInfoModal} className="w-fit cursor-pointer transform-all duration-300 bg-white dark:bg-neutral-800 pl-2 hover:text-neutral-400">
                CLOSE
              </div>
            </div>

            <div className="w-full text-base font-medium mb-12 pt-8 pb-14 md:pt-14 flex flex-col">

              <div className="border-t-[1px] border-black mb-5 dark:border-white">About </div>
              <div className="w-full max-w-5xl mb-5">
                This project aims to offer a free, distraction-free text editor, that allows users to focus on writing without unnecessary interruptions. This project also includes the option to download the content in *.txt, a universally accessible file formats, ensuring compatibility across platforms and operating systems. The downloaded file will mark the date and time when the content is created.
                <br /><br />
                The content is stored locally in the browser, no one can see it but you. It will stay in the browser, unless you clear the cookies, or click the clear button.
                <br /><br />
                The editor is still in beta and have several bugs, please try with caution.
                <br /><br />
                I'd love to hear what you think of the project, or if you have any feedback.<br />
                You can reach me on hello@josephadisurya.com
              </div>

              <div className="border-t-[1px] border-black mb-5 mt-14 dark:border-white">Upcoming update</div>
              <ul className="list-disc pl-5">
                <li>Add how to</li>
                <li>Download as .md and .pdf options</li>
                <li>Styling texts</li>
                <li>Offline mode</li>
                <li className="line-through text-neutral-400 dark:text-neutral-600">Auto dark mode</li>
                <li className="line-through text-neutral-400 dark:text-neutral-600">Add tooltips to buttons</li>
              </ul>
              <div className="border-t-[1px] border-black mb-5 mt-14 dark:border-white">Upcoming bug fix</div>
              <ul className="list-disc pl-5">
                <li>Text area too low after refreshing</li>
                <li className="line-through text-neutral-400 dark:text-neutral-600">Word count doesn't count title</li>

              </ul>

              <div className="border-t-[1px] border-black mb-5 mt-14 dark:border-white">Colophon</div>
              <div className="">Font</div>
              <div className="mb-5">Satoshi by Deni Anggara</div>

              <div>Design</div>
              <div className="mb-5">Joseph Adisurya</div>

              <div>Code</div>
              <div className="mb-5">AI-generated, with modifications by Joseph Adisurya</div>

              <div>Icons</div>
              <div className="mb-5">Google Material Design Icons</div>


            </div>

          </div>

        </div>
      )}
    </>
  );
}

export default function InfoModal({ isInfoOpen, closeInfoModal }) {
  if (!isInfoOpen) return null;

  return (
    <div className="fixed inset-0 flex flex-col items-center z-30 max-w-full">
      <div className="bg-white dark:bg-neutral-800 p-5 w-full h-full flex flex-col overflow-y-auto relative">
        <div className="w-full text-right justify-end flex sticky top-0">
          <div onClick={closeInfoModal} className="w-fit cursor-pointer transform-all duration-300 bg-white dark:bg-neutral-800 pl-2 hover:text-neutral-400">
            CLOSE
          </div>
        </div>

        <div className="w-full text-base font-medium mb-12 pt-8 pb-14 md:pt-14 flex flex-col">

          <div className="border-t-[1px] border-black mb-5 dark:border-white">About</div>
          <div className="w-full max-w-5xl mb-5">
            This project aims to offer a free, distraction-free text editor, that allows users to focus on writing without unnecessary interruptions. This project also includes the option to download the content in *.txt, *.md, and *.pdf, universally accessible file formats, ensuring compatibility across platforms and operating systems. The downloaded file will mark the date and time when the content is created.
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
            <li>Styling texts</li>
            <li>Offline mode</li>
            <li className="line-through text-neutral-400 dark:text-neutral-600">Download as .md and .pdf options</li>
            <li className="line-through text-neutral-400 dark:text-neutral-600">Auto dark mode</li>
            <li className="line-through text-neutral-400 dark:text-neutral-600">Add tooltips to buttons</li>
          </ul>

          <div className="border-t-[1px] border-black mb-5 mt-14 dark:border-white">Upcoming bug fix</div>
          <ul className="list-disc pl-5">
            <li className="line-through text-neutral-400 dark:text-neutral-600">Text area too low after refreshing</li>
            <li className="line-through text-neutral-400 dark:text-neutral-600">Word count doesn&apos;t count title</li>
          </ul>

          <div className="border-t-[1px] border-black mb-5 mt-14 dark:border-white">Colophon</div>
          <div>Font</div>
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
  );
}
